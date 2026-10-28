import { inngest } from "@/lib/inngest/client";
import { prisma } from "@/lib/prisma";
import { sendReminderEmail } from "@/lib/email";
import { deleteCalendarEvent } from "@/lib/google-calendar";
import { getAdminSettings } from "@/lib/settings";
import { subHours, setHours, setMinutes, startOfDay } from "date-fns";
import { toZonedTime, fromZonedTime } from "date-fns-tz";
import { APP_TZ } from "@/lib/timezone";

export const expireHold = inngest.createFunction(
  { id: "booking-hold-expire" },
  { event: "booking/hold.expire" },
  async ({ event }) => {
    const bookingId = event.data.bookingId as string;
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking || booking.status !== "HOLD") return { skipped: true };

    if (booking.holdExpiresAt && booking.holdExpiresAt > new Date()) {
      return { skipped: true, reason: "not-expired" };
    }

    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED" },
    });

    if (booking.googleEventId) {
      await deleteCalendarEvent(booking.googleEventId);
    }

    return { expired: bookingId };
  },
);

export const scheduleReminders = inngest.createFunction(
  { id: "booking-reminders-schedule" },
  { event: "booking/reminders.schedule" },
  async ({ event, step }) => {
    const bookingId = event.data.bookingId as string;
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { service: true },
    });
    if (!booking || booking.status !== "CONFIRMED") return { skipped: true };

    const settings = await getAdminSettings();
    const startsAt = booking.startsAt;

    const jobs: { type: "H48" | "H24" | "MORNING"; at: Date; label: string }[] = [];

    if (settings.reminderH48) {
      jobs.push({ type: "H48", at: subHours(startsAt, 48), label: "(in 48 hours)" });
    }
    if (settings.reminderH24) {
      jobs.push({ type: "H24", at: subHours(startsAt, 24), label: "(tomorrow)" });
    }
    if (settings.reminderMorning) {
      const zoned = toZonedTime(startsAt, settings.timezone || APP_TZ);
      const morningLocal = setMinutes(setHours(startOfDay(zoned), 8), 0);
      jobs.push({
        type: "MORNING",
        at: fromZonedTime(morningLocal, settings.timezone || APP_TZ),
        label: "(this morning)",
      });
    }

    for (const job of jobs) {
      if (job.at <= new Date()) continue;
      await step.sendEvent(`remind-${job.type}`, {
        name: "booking/remind.send",
        data: { bookingId, type: job.type, label: job.label },
        ts: job.at.getTime(),
      });
    }

    return { scheduled: jobs.length };
  },
);

export const sendReminder = inngest.createFunction(
  { id: "booking-remind-send" },
  { event: "booking/remind.send" },
  async ({ event }) => {
    const bookingId = event.data.bookingId as string;
    const type = event.data.type as "H48" | "H24" | "MORNING";
    const label = (event.data.label as string) ?? "";

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { service: true },
    });
    if (!booking || booking.status !== "CONFIRMED") return { skipped: true };

    try {
      await prisma.reminderLog.create({
        data: { bookingId, type },
      });
    } catch {
      return { skipped: true, reason: "already-sent" };
    }

    await sendReminderEmail({
      to: booking.guestEmail,
      guestName: booking.guestName,
      serviceTitle: booking.service.title,
      startsAt: booking.startsAt,
      label,
    });

    return { sent: type };
  },
);

export const inngestFunctions = [expireHold, scheduleReminders, sendReminder];
