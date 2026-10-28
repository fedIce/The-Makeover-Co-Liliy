import Link from "next/link";
import { addDays, startOfWeek } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { prisma } from "@/lib/prisma";
import { hasDatabaseUrl } from "@/lib/db-ready";
import { APP_TZ } from "@/lib/timezone";

export default async function AdminAgendaPage() {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = addDays(weekStart, 7);

  const bookings = hasDatabaseUrl()
    ? await prisma.booking.findMany({
        where: {
          status: { in: ["CONFIRMED", "COMPLETED", "NO_SHOW"] },
          startsAt: { gte: weekStart, lt: weekEnd },
        },
        include: { service: true },
        orderBy: { startsAt: "asc" },
      })
    : [];

  const todayKey = formatInTimeZone(now, APP_TZ, "yyyy-MM-dd");
  const today = bookings.filter(
    (b) => formatInTimeZone(b.startsAt, APP_TZ, "yyyy-MM-dd") === todayKey,
  );

  return (
    <div>
      <h1 className="font-serif text-3xl text-cream">Agenda</h1>
      <p className="mt-2 text-sm text-cream/50">
        Week of {formatInTimeZone(weekStart, APP_TZ, "d MMM yyyy")} · Asia/Nicosia
      </p>

      <section className="mt-10">
        <h2 className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-copper">
          Today
        </h2>
        <ul className="mt-4 space-y-3">
          {today.map((b) => (
            <AgendaRow key={b.id} booking={b} />
          ))}
          {!today.length && <p className="text-sm text-cream/40">No appointments today.</p>}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-copper">
          This week
        </h2>
        <ul className="mt-4 space-y-3">
          {bookings.map((b) => (
            <AgendaRow key={b.id} booking={b} />
          ))}
          {!bookings.length && <p className="text-sm text-cream/40">No bookings this week.</p>}
        </ul>
      </section>
    </div>
  );
}

function AgendaRow({
  booking,
}: {
  booking: {
    id: string;
    guestName: string;
    guestEmail: string;
    status: string;
    startsAt: Date;
    googleEventId: string | null;
    service: { title: string };
  };
}) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 border border-cream/10 bg-charcoal-soft px-4 py-3">
      <div>
        <p className="text-sm text-cream">
          {formatInTimeZone(booking.startsAt, APP_TZ, "EEE HH:mm")} · {booking.service.title}
        </p>
        <p className="text-xs text-cream/50">
          {booking.guestName} · {booking.guestEmail} · {booking.status}
        </p>
      </div>
      <div className="flex gap-3 text-[0.65rem] uppercase tracking-wider">
        <Link href={`/admin/bookings/${booking.id}`} className="text-copper hover:underline">
          Open
        </Link>
        {booking.googleEventId && (
          <a
            href="https://calendar.google.com"
            target="_blank"
            rel="noreferrer"
            className="text-cream/40 hover:text-cream"
          >
            Calendar
          </a>
        )}
      </div>
    </li>
  );
}
