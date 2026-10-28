import { getTranslations, setRequestLocale } from "next-intl/server";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "@/i18n/navigation";
import { formatEur } from "@/lib/money";
import { formatInTimeZone } from "date-fns-tz";
import { APP_TZ } from "@/lib/timezone";
import { hasDatabaseUrl } from "@/lib/db-ready";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export default async function BookSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ session_id?: string; bookingId?: string; dev?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("book.success");
  const { session_id, bookingId, dev } = await searchParams;

  let title: string | null = null;
  let when: string | null = null;
  let depositPaidCents = 0;
  let balanceDueCents = 0;

  if (hasDatabaseUrl()) {
    try {
      let resolvedId = bookingId;

      if (!resolvedId && session_id && process.env.STRIPE_SECRET_KEY) {
        const session = await stripe.checkout.sessions.retrieve(session_id);
        resolvedId = session.metadata?.bookingId;
      }

      if (resolvedId) {
        const booking = await prisma.booking.findUnique({
          where: { id: resolvedId },
          include: { service: true },
        });
        if (booking) {
          title = booking.service.title;
          when = formatInTimeZone(booking.startsAt, APP_TZ, "EEEE d MMMM yyyy 'at' HH:mm");
          depositPaidCents = booking.depositPaidCents;
          balanceDueCents = booking.balanceDueCents;
        }
      }
    } catch {
      // show generic success
    }
  }

  return (
    <>
      <Header />
      <main className="flex-1 pt-[var(--header-h)]">
        <div className="mx-auto max-w-xl px-5 py-16 text-center lg:px-8">
          {dev === "1" ? (
            <p className="mb-4 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-copper">
              {t("devMode")}
            </p>
          ) : null}
          <p className="section-label">{t("label")}</p>
          <h1 className="mt-4 font-serif text-3xl font-medium">{t("title")}</h1>
          {title && when ? (
            <div className="mt-6 text-sm text-muted">
              <p>{t("summary", { title, when })}</p>
              <p className="mt-2">
                {t("depositPaid", { amount: formatEur(depositPaidCents) })}
              </p>
              <p>{t("balanceDue", { amount: formatEur(balanceDueCents) })}</p>
            </div>
          ) : (
            <p className="mt-6 text-sm text-muted">{t("generic")}</p>
          )}
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link href="/account" className="btn-primary">
              {t("viewAppointments")}
            </Link>
            <Link href="/login" className="btn-outline">
              {t("signInEmail")}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
