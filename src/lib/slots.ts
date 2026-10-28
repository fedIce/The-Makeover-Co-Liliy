import { addDays, addMinutes, format, parse } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import type { AvailabilityException, AvailabilityRule, Service } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { fetchBusyIntervals } from "@/lib/google-calendar";
import { getAdminSettings } from "@/lib/settings";
import { APP_TZ } from "@/lib/timezone";

const SLOT_GRID_MIN = 30;

type Interval = { start: Date; end: Date };

export type DayAvailability = {
  date: string;
  /** Bookable start times for the selected service. */
  slots: number;
  /** Max appointments that fit in working hours for this service’s time block. */
  capacity: number;
  /** Salon holds/confirmed bookings starting that day (not Google reminders). */
  booked: number;
  /** 0 = empty … 1 = full. */
  saturation: number;
};

export type SlotOption = {
  time: string;
  available: boolean;
  /** Why a start time is greyed out in the picker. */
  reason?: "past" | "busy";
};

function overlaps(a: Interval, b: Interval) {
  return a.start < b.end && b.start < a.end;
}

function parseLocalOnDate(dateKey: string, hhmm: string, tz: string): Date {
  const local = parse(`${dateKey} ${hhmm}`, "yyyy-MM-dd HH:mm", new Date());
  return fromZonedTime(local, tz);
}

/** Calendar weekday for a YYYY-MM-DD key (0=Sun … 6=Sat), timezone-safe. */
function weekdayFromDateKey(dateKey: string): number {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

/** Prisma @db.Date values are UTC midnight for that calendar day. */
function exceptionDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function workingWindowsForDay(
  dateKey: string,
  rules: AvailabilityRule[],
  exceptions: AvailabilityException[],
  tz: string,
): Interval[] {
  const dayException = exceptions.find((e) => exceptionDateKey(e.date) === dateKey);
  if (dayException?.closed) return [];
  if (dayException && !dayException.closed && dayException.startTime && dayException.endTime) {
    return [
      {
        start: parseLocalOnDate(dateKey, dayException.startTime, tz),
        end: parseLocalOnDate(dateKey, dayException.endTime, tz),
      },
    ];
  }

  const weekday = weekdayFromDateKey(dateKey);
  return rules
    .filter((r) => r.weekday === weekday)
    .map((r) => ({
      start: parseLocalOnDate(dateKey, r.startTime, tz),
      end: parseLocalOnDate(dateKey, r.endTime, tz),
    }));
}

function buildSlotOptionsForDay(input: {
  dateKey: string;
  service: Pick<Service, "durationMin" | "bufferMin">;
  rules: AvailabilityRule[];
  exceptions: AvailabilityException[];
  busy: Interval[];
  tz: string;
  now: Date;
}): SlotOption[] {
  const windows = workingWindowsForDay(
    input.dateKey,
    input.rules,
    input.exceptions,
    input.tz,
  );
  if (!windows.length) return [];

  const blockMinutes = input.service.durationMin + input.service.bufferMin;
  const minStart = addMinutes(input.now, 60);
  const options: SlotOption[] = [];

  for (const window of windows) {
    let cursor = window.start;
    while (addMinutes(cursor, blockMinutes) <= window.end) {
      const busyEnd = addMinutes(cursor, blockMinutes);
      const candidate = { start: cursor, end: busyEnd };
      const tooSoon = cursor <= minStart;
      const conflict = input.busy.some((b) => overlaps(candidate, b));
      const time = format(toZonedTime(cursor, input.tz), "HH:mm");

      if (tooSoon) {
        options.push({ time, available: false, reason: "past" });
      } else if (conflict) {
        options.push({ time, available: false, reason: "busy" });
      } else {
        options.push({ time, available: true });
      }

      cursor = addMinutes(cursor, SLOT_GRID_MIN);
    }
  }

  return options;
}

async function loadBusy(rangeStart: Date, rangeEnd: Date, now: Date) {
  const [dbBusy, gcalBusy] = await Promise.all([
    prisma.booking.findMany({
      where: {
        status: { in: ["HOLD", "CONFIRMED"] },
        startsAt: { lt: rangeEnd },
        endsAt: { gt: rangeStart },
        OR: [
          { status: "CONFIRMED" },
          { status: "HOLD", holdExpiresAt: { gt: now } },
        ],
      },
      select: {
        startsAt: true,
        endsAt: true,
        service: { select: { bufferMin: true, durationMin: true } },
      },
    }),
    fetchBusyIntervals(rangeStart, rangeEnd).catch(() => [] as Interval[]),
  ]);

  /** Real salon bookings only — used for calendar heat (not every Google reminder). */
  const appointments: Interval[] = dbBusy.map((b) => ({
    start: b.startsAt,
    end: addMinutes(b.startsAt, b.service.durationMin + b.service.bufferMin),
  }));

  /** Appointments + Google free/busy — used to hide start times that collide. */
  const blocked: Interval[] = [...appointments, ...gcalBusy];

  return { appointments, blocked };
}

export async function getSlotOptions(
  serviceId: string,
  dateKey: string,
): Promise<SlotOption[]> {
  const settings = await getAdminSettings();
  const tz = settings.timezone || APP_TZ;

  const service = await prisma.service.findFirst({
    where: { id: serviceId, active: true },
  });
  if (!service) return [];

  const rangeStart = parseLocalOnDate(dateKey, "00:00", tz);
  const rangeEnd = parseLocalOnDate(dateKey, "23:59", tz);
  const now = new Date();

  const [rules, exceptions, busy] = await Promise.all([
    prisma.availabilityRule.findMany(),
    prisma.availabilityException.findMany({
      where: {
        date: {
          gte: addDays(rangeStart, -1),
          lte: addDays(rangeEnd, 1),
        },
      },
    }),
    loadBusy(rangeStart, rangeEnd, now),
  ]);

  return buildSlotOptionsForDay({
    dateKey,
    service,
    rules,
    exceptions,
    busy: busy.blocked,
    tz,
    now,
  });
}

/** Available start times only (for day-level bookability). */
export async function getAvailableSlots(serviceId: string, dateKey: string): Promise<string[]> {
  const options = await getSlotOptions(serviceId, dateKey);
  return options.filter((o) => o.available).map((o) => o.time);
}

function workingMinutes(windows: Interval[]) {
  return windows.reduce((sum, w) => sum + (w.end.getTime() - w.start.getTime()) / 60_000, 0);
}

function bookedStartingOnDay(dateKey: string, busy: Interval[], tz: string) {
  const dayStart = parseLocalOnDate(dateKey, "00:00", tz);
  const dayEnd = addDays(dayStart, 1);
  return busy.filter((b) => b.start >= dayStart && b.start < dayEnd).length;
}

export async function getDaysWithAvailability(
  serviceId: string,
  fromDateKey: string,
  days: number,
): Promise<DayAvailability[]> {
  const settings = await getAdminSettings();
  const tz = settings.timezone || APP_TZ;

  const service = await prisma.service.findFirst({
    where: { id: serviceId, active: true },
  });
  if (!service) return [];

  const dateKeys: string[] = [];
  let cursor = parse(fromDateKey, "yyyy-MM-dd", new Date());
  for (let i = 0; i < days; i++) {
    dateKeys.push(format(cursor, "yyyy-MM-dd"));
    cursor = addDays(cursor, 1);
  }

  const rangeStart = parseLocalOnDate(dateKeys[0]!, "00:00", tz);
  const rangeEnd = parseLocalOnDate(dateKeys[dateKeys.length - 1]!, "23:59", tz);
  const now = new Date();

  const [rules, exceptions, busy] = await Promise.all([
    prisma.availabilityRule.findMany(),
    prisma.availabilityException.findMany({
      where: {
        date: {
          gte: addDays(rangeStart, -1),
          lte: addDays(rangeEnd, 1),
        },
      },
    }),
    loadBusy(rangeStart, rangeEnd, now),
  ]);

  const result: DayAvailability[] = [];
  for (const dateKey of dateKeys) {
    const windows = workingWindowsForDay(dateKey, rules, exceptions, tz);
    const blockMin = Math.max(30, service.durationMin + service.bufferMin);
    const capacity = Math.max(0, Math.floor(workingMinutes(windows) / blockMin));
    const booked = bookedStartingOnDay(dateKey, busy.appointments, tz);
    const options = buildSlotOptionsForDay({
      dateKey,
      service,
      rules,
      exceptions,
      busy: busy.blocked,
      tz,
      now,
    });
    const openSlots = options.filter((o) => o.available).length;
    const saturation =
      capacity <= 0 ? 0 : Math.min(1, booked / capacity);

    result.push({
      date: dateKey,
      slots: openSlots,
      capacity,
      booked,
      saturation,
    });
  }
  return result;
}

export function computeEndsAt(startsAt: Date, service: Pick<Service, "durationMin">) {
  return addMinutes(startsAt, service.durationMin);
}

export function parseSlotStart(dateKey: string, timeHHmm: string, tz = APP_TZ) {
  return parseLocalOnDate(dateKey, timeHHmm, tz);
}
