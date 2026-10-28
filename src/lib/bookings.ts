import { addMinutes } from "date-fns";
import { prisma } from "@/lib/prisma";
import { getAdminSettings } from "@/lib/settings";
import { balanceDue } from "@/lib/money";
import { parseSlotStart, computeEndsAt } from "@/lib/slots";
import { createCalendarEvent, deleteCalendarEvent } from "@/lib/google-calendar";
import {
  notifyAdminNewBooking,
  sendBookingCancelledEmail,
  sendBookingConfirmedEmail,
  sendSlotLostRefundEmail,
} from "@/lib/email";
import { inngest } from "@/lib/inngest/client";
import { stripe } from "@/lib/stripe";
import { APP_TZ } from "@/lib/timezone";

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? process.env.AUTH_URL ?? "http://localhost:3000";
}

export async function createHold(input: {
  serviceId: string;
  dateKey: string;
  timeHHmm: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  notes?: string;
  clientId?: string;
}) {
  const settings = await getAdminSettings();
  const service = await prisma.service.findFirstOrThrow({
    where: { id: input.serviceId, active: true },
  });

  const startsAt = parseSlotStart(input.dateKey, input.timeHHmm, settings.timezone || APP_TZ);
  const endsAt = computeEndsAt(startsAt, service);
  const busyEnd = addMinutes(startsAt, service.durationMin + service.bufferMin);
  const holdExpiresAt = addMinutes(new Date(), settings.holdTtlMinutes);

  const candidates = await prisma.booking.findMany({
    where: {
      status: { in: ["HOLD", "CONFIRMED"] },
      startsAt: { lt: busyEnd },
      OR: [
        { status: "CONFIRMED" },
        { status: "HOLD", holdExpiresAt: { gt: new Date() } },
      ],
    },
    include: { service: { select: { durationMin: true, bufferMin: true } } },
  });

  const conflict = candidates.find((b) => {
    const theirEnd = addMinutes(b.startsAt, b.service.durationMin + b.service.bufferMin);
    return theirEnd > startsAt;
  });

  if (conflict) {
    throw new Error("SLOT_UNAVAILABLE");
  }

  const deposit = service.depositCents;
  const booking = await prisma.booking.create({
    data: {
      serviceId: service.id,
      clientId: input.clientId,
      guestName: input.guestName,
      guestEmail: input.guestEmail.toLowerCase(),
      guestPhone: input.guestPhone,
      notes: input.notes,
      startsAt,
      endsAt,
      status: "HOLD",
      holdExpiresAt,
      depositPaidCents: 0,
      balanceDueCents: balanceDue(service.priceCents, deposit),
    },
    include: { service: true },
  });

  await inngest.send({
    name: "booking/hold.expire",
    data: { bookingId: booking.id },
    ts: holdExpiresAt.getTime(),
  }).catch(() => {
    // Inngest optional in local without keys
  });

  return booking;
}

export async function confirmBookingFromStripe(input: {
  bookingId: string;
  stripeSessionId: string;
  paymentIntentId?: string | null;
  amountTotal?: number | null;
}) {
  const booking = await prisma.booking.findUnique({
    where: { id: input.bookingId },
    include: { service: true },
  });
  if (!booking) throw new Error("BOOKING_NOT_FOUND");
  if (booking.status === "CONFIRMED") return booking;

  const busyEnd = addMinutes(
    booking.startsAt,
    booking.service.durationMin + booking.service.bufferMin,
  );

  const existingConfirmed = await prisma.booking.findMany({
    where: {
      id: { not: booking.id },
      status: "CONFIRMED",
      startsAt: { lt: busyEnd },
    },
    include: { service: { select: { durationMin: true, bufferMin: true } } },
  });

  const conflict = existingConfirmed.find((b) => {
    const theirEnd = addMinutes(b.startsAt, b.service.durationMin + b.service.bufferMin);
    return theirEnd > booking.startsAt;
  });

  if (conflict) {
    if (input.paymentIntentId && !input.paymentIntentId.startsWith("dev_")) {
      await stripe.refunds.create({ payment_intent: input.paymentIntentId });
    }
    await prisma.booking.update({
      where: { id: booking.id },
      data: { status: "CANCELLED" },
    });
    await sendSlotLostRefundEmail({
      to: booking.guestEmail,
      guestName: booking.guestName,
      bookUrl: `${appUrl()}/book?service=${booking.service.slug}`,
    });
    throw new Error("SLOT_CONFLICT_REFUNDED");
  }

  let client = await prisma.user.findUnique({ where: { email: booking.guestEmail } });
  if (!client) {
    client = await prisma.user.create({
      data: {
        email: booking.guestEmail,
        name: booking.guestName,
        phone: booking.guestPhone,
        role: "CLIENT",
      },
    });
  }

  const depositPaid = input.amountTotal ?? booking.service.depositCents;
  const eventId = await createCalendarEvent({
    summary: `${booking.service.title} — ${booking.guestName}`,
    description: [
      `Client: ${booking.guestName}`,
      `Email: ${booking.guestEmail}`,
      booking.guestPhone ? `Phone: ${booking.guestPhone}` : null,
      booking.notes ? `Notes: ${booking.notes}` : null,
      `Admin: ${appUrl()}/admin/bookings/${booking.id}`,
    ]
      .filter(Boolean)
      .join("\n"),
    startsAt: booking.startsAt,
    endsAt: booking.endsAt,
  });

  const confirmed = await prisma.booking.update({
    where: { id: booking.id },
    data: {
      status: "CONFIRMED",
      holdExpiresAt: null,
      clientId: client.id,
      stripeSessionId: input.stripeSessionId,
      stripePaymentIntentId: input.paymentIntentId ?? undefined,
      depositPaidCents: depositPaid,
      balanceDueCents: balanceDue(booking.service.priceCents, depositPaid),
      googleEventId: eventId,
    },
    include: { service: true },
  });

  await sendBookingConfirmedEmail({
    to: confirmed.guestEmail,
    guestName: confirmed.guestName,
    serviceTitle: confirmed.service.title,
    startsAt: confirmed.startsAt,
    depositPaidCents: confirmed.depositPaidCents,
    balanceDueCents: confirmed.balanceDueCents,
    accountUrl: `${appUrl()}/account`,
  });

  await notifyAdminNewBooking({
    serviceTitle: confirmed.service.title,
    guestName: confirmed.guestName,
    guestEmail: confirmed.guestEmail,
    startsAt: confirmed.startsAt,
  });

  await inngest.send({
    name: "booking/reminders.schedule",
    data: { bookingId: confirmed.id },
  }).catch(() => undefined);

  return confirmed;
}

export async function cancelBooking(bookingId: string, opts?: { force?: boolean }) {
  const settings = await getAdminSettings();
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { service: true },
  });
  if (!booking || booking.status !== "CONFIRMED") {
    throw new Error("NOT_CANCELLABLE");
  }

  const hoursLeft = (booking.startsAt.getTime() - Date.now()) / (1000 * 60 * 60);
  if (!opts?.force && hoursLeft < settings.cancelWindowHours) {
    throw new Error("CANCEL_WINDOW");
  }

  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "CANCELLED" },
    include: { service: true },
  });

  if (updated.googleEventId) {
    await deleteCalendarEvent(updated.googleEventId);
  }

  await sendBookingCancelledEmail({
    to: updated.guestEmail,
    guestName: updated.guestName,
    serviceTitle: updated.service.title,
    startsAt: updated.startsAt,
  });

  return updated;
}
