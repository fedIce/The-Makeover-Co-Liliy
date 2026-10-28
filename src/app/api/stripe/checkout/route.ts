import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { confirmBookingFromStripe } from "@/lib/bookings";
import { isPaymentDevMode } from "@/lib/payments";
import { stripe } from "@/lib/stripe";

const bodySchema = z.object({
  bookingId: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const booking = await prisma.booking.findUnique({
    where: { id: parsed.data.bookingId },
    include: { service: true },
  });

  if (!booking || booking.status !== "HOLD") {
    return NextResponse.json({ error: "Booking hold not found" }, { status: 404 });
  }

  if (booking.holdExpiresAt && booking.holdExpiresAt < new Date()) {
    return NextResponse.json({ error: "Hold expired" }, { status: 410 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.AUTH_URL ?? "http://localhost:3000";

  if (isPaymentDevMode()) {
    const sessionId = `dev_cs_${booking.id}`;
    await confirmBookingFromStripe({
      bookingId: booking.id,
      stripeSessionId: sessionId,
      paymentIntentId: `dev_pi_${booking.id}`,
      amountTotal: booking.service.depositCents,
    });
    return NextResponse.json({
      url: `${appUrl}/book/success?bookingId=${booking.id}&dev=1`,
      devMode: true,
    });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Stripe is not configured" }, { status: 503 });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: booking.guestEmail,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: booking.service.depositCents,
          product_data: {
            name: `Deposit — ${booking.service.title}`,
            description: `Appointment deposit. Balance ${((booking.service.priceCents - booking.service.depositCents) / 100).toFixed(2)} EUR due in salon.`,
          },
        },
      },
    ],
    metadata: { bookingId: booking.id },
    success_url: `${appUrl}/book/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/book?cancelled=1&service=${booking.service.slug}`,
    expires_at: Math.floor((booking.holdExpiresAt?.getTime() ?? Date.now() + 12 * 60_000) / 1000),
  });

  await prisma.booking.update({
    where: { id: booking.id },
    data: { stripeSessionId: session.id },
  });

  return NextResponse.json({ url: session.url });
}
