import Link from "next/link";
import { notFound } from "next/navigation";
import { formatInTimeZone } from "date-fns-tz";
import { prisma } from "@/lib/prisma";
import { formatEur } from "@/lib/money";
import { APP_TZ } from "@/lib/timezone";
import AdminBookingActions from "@/components/admin/AdminBookingActions";

export default async function AdminBookingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { service: true, client: true },
  });
  if (!booking) notFound();

  return (
    <div>
      <Link href="/admin" className="text-xs text-copper">
        ← Agenda
      </Link>
      <h1 className="mt-4 font-serif text-3xl">{booking.service.title}</h1>
      <p className="mt-2 text-sm text-cream/60">
        {formatInTimeZone(booking.startsAt, APP_TZ, "EEEE d MMMM yyyy 'at' HH:mm")}
      </p>

      <dl className="mt-8 grid gap-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-cream/40">Client</dt>
          <dd>
            {booking.guestName}
            <br />
            {booking.guestEmail}
            <br />
            {booking.guestPhone}
          </dd>
        </div>
        <div>
          <dt className="text-cream/40">Money</dt>
          <dd>
            Deposit {formatEur(booking.depositPaidCents)}
            <br />
            Balance {formatEur(booking.balanceDueCents)}
            <br />
            Status {booking.status}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-cream/40">Notes</dt>
          <dd className="whitespace-pre-wrap">{booking.notes || "—"}</dd>
        </div>
      </dl>

      <AdminBookingActions bookingId={booking.id} status={booking.status} />
    </div>
  );
}
