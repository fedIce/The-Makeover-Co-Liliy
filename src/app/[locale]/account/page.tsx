import { getTranslations, setRequestLocale } from "next-intl/server";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "@/i18n/navigation";
import { requireUser } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { hasDatabaseUrl } from "@/lib/db-ready";
import { formatEur } from "@/lib/money";
import { formatInTimeZone } from "date-fns-tz";
import { APP_TZ } from "@/lib/timezone";
import CancelBookingButton from "@/components/account/CancelBookingButton";
import SignOutButton from "@/components/auth/SignOutButton";

export const dynamic = "force-dynamic";

export default async function AccountPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("account");
  const session = await requireUser();
  const bookings = hasDatabaseUrl()
    ? await prisma.booking.findMany({
        where: {
          OR: [{ clientId: session.user.id }, { guestEmail: session.user.email ?? "" }],
          status: { in: ["CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"] },
        },
        include: { service: true },
        orderBy: { startsAt: "asc" },
      })
    : [];

  const now = new Date();
  const upcoming = bookings.filter((b) => b.status === "CONFIRMED" && b.startsAt >= now);
  const past = bookings.filter((b) => !(b.status === "CONFIRMED" && b.startsAt >= now)).reverse();

  return (
    <>
      <Header />
      <main className="flex-1 pt-[var(--header-h)]">
        <div className="mx-auto max-w-3xl px-5 py-12 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="section-label">{t("label")}</p>
              <h1 className="mt-2 font-serif text-3xl font-medium">{t("title")}</h1>
              <p className="mt-1 text-sm text-muted">{session.user.email}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <SignOutButton className="btn-outline" />
              <Link href="/book" className="btn-primary">
                {t("bookAgain")}
              </Link>
            </div>
          </div>

          <section className="mt-12">
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-copper">
              {t("upcoming")}
            </h2>
            <ul className="mt-4 space-y-4">
              {upcoming.map((b) => (
                <li key={b.id} className="border border-ink/10 bg-white p-5">
                  <p className="font-serif text-lg">{b.service.title}</p>
                  <p className="mt-1 text-sm text-muted">
                    {formatInTimeZone(b.startsAt, APP_TZ, "EEEE d MMMM yyyy 'at' HH:mm")}
                  </p>
                  <p className="mt-2 text-sm">
                    {t("depositBalance", {
                      deposit: formatEur(b.depositPaidCents),
                      balance: formatEur(b.balanceDueCents),
                    })}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <CancelBookingButton bookingId={b.id} />
                    <Link
                      href={`/book?service=${b.service.slug}`}
                      className="text-xs font-semibold uppercase tracking-wider text-ink hover:text-copper"
                    >
                      {t("reschedule")}
                    </Link>
                  </div>
                </li>
              ))}
              {!upcoming.length && <p className="text-sm text-muted">{t("noUpcoming")}</p>}
            </ul>
          </section>

          <section className="mt-12">
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-copper">
              {t("past")}
            </h2>
            <ul className="mt-4 space-y-3">
              {past.map((b) => (
                <li key={b.id} className="border border-ink/5 px-4 py-3 text-sm">
                  <span className="font-medium">{b.service.title}</span>
                  <span className="text-muted">
                    {" "}
                    · {formatInTimeZone(b.startsAt, APP_TZ, "d MMM yyyy")} ·{" "}
                    {t(`status.${b.status}`)}
                  </span>
                </li>
              ))}
              {!past.length && <p className="text-sm text-muted">{t("noPast")}</p>}
            </ul>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
