"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { addDays, format, parse } from "date-fns";
import { useRouter } from "@/i18n/navigation";
import { formatEur } from "@/lib/money";

type Service = {
  id: string;
  slug: string;
  title: string;
  description: string;
  durationMin: number;
  priceCents: number;
  depositCents: number;
};

type Step = "service" | "date" | "time" | "details" | "review";

type DayMeta = {
  date: string;
  slots: number;
  capacity: number;
  booked: number;
  saturation: number;
};

type SlotOption = {
  time: string;
  available: boolean;
  reason?: "past" | "busy";
};

function dayHeatClass(meta: DayMeta | undefined, available: boolean, selected: boolean) {
  if (selected) return "bg-copper text-white";
  if (!available || !meta) return "text-ink/20";

  const s = meta.saturation;
  if (s <= 0) return "bg-white text-ink hover:bg-cream-deep";
  if (s < 0.34) return "bg-sand/70 text-ink hover:bg-sand";
  if (s < 0.67) return "bg-copper/25 text-ink hover:bg-copper/35";
  if (s < 1) return "bg-copper/45 text-ink hover:bg-copper/55";
  return "bg-copper/70 text-white hover:bg-copper/80";
}

export default function BookWizard({
  initialServices = [],
}: {
  initialServices?: Service[];
}) {
  const t = useTranslations("book");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const searchParams = useSearchParams();
  const serviceSlug = searchParams.get("service");
  const [services, setServices] = useState<Service[]>(initialServices);
  const [servicesLoading, setServicesLoading] = useState(initialServices.length === 0);
  const [step, setStep] = useState<Step>("service");
  const [service, setService] = useState<Service | null>(null);
  const [monthStart, setMonthStart] = useState(() => format(new Date(), "yyyy-MM-01"));
  const [availableDays, setAvailableDays] = useState<string[]>([]);
  const [dayMetaByDate, setDayMetaByDate] = useState<Record<string, DayMeta>>({});
  const [daysLoading, setDaysLoading] = useState(false);
  const [dateKey, setDateKey] = useState<string | null>(null);
  const [slotOptions, setSlotOptions] = useState<SlotOption[]>([]);
  const [timeHHmm, setTimeHHmm] = useState<string | null>(null);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmClose, setConfirmClose] = useState(false);

  function applyServices(list: Service[]) {
    setServices(list);
    if (!serviceSlug) return;
    const match = list.find((s) => s.slug === serviceSlug);
    if (match) {
      setService(match);
      setStep("date");
    }
  }

  async function loadServices() {
    setServicesLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/services", { cache: "no-store" });
      const data = await res.json().catch(() => null);
      if (!res.ok || !Array.isArray(data)) {
        throw new Error(t("service.loadError"));
      }
      applyServices(data);
    } catch {
      setError(t("service.loadError"));
    } finally {
      setServicesLoading(false);
    }
  }

  useEffect(() => {
    if (initialServices.length > 0) {
      applyServices(initialServices);
      setServicesLoading(false);
      return;
    }
    void loadServices();
    // Only re-run when deep-link slug changes — not when parent re-sends the same list
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceSlug]);

  useEffect(() => {
    if (!service) return;
    const from = monthStart;
    const ac = new AbortController();
    setDaysLoading(true);
    fetch(`/api/slots?serviceId=${service.id}&from=${from}&days=42`, { signal: ac.signal })
      .then((r) => r.json())
      .then((data) => {
        setAvailableDays(data.days ?? []);
        const map: Record<string, DayMeta> = {};
        for (const row of (data.dayMeta ?? []) as DayMeta[]) {
          map[row.date] = row;
        }
        setDayMetaByDate(map);
      })
      .catch((err) => {
        if (err?.name !== "AbortError") {
          setAvailableDays([]);
          setDayMetaByDate({});
        }
      })
      .finally(() => setDaysLoading(false));
    return () => ac.abort();
  }, [service, monthStart]);

  useEffect(() => {
    if (!service || !dateKey) return;
    fetch(`/api/slots?serviceId=${service.id}&date=${dateKey}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.options)) {
          setSlotOptions(data.options);
          return;
        }
        setSlotOptions(
          ((data.slots ?? []) as string[]).map((time) => ({ time, available: true })),
        );
      })
      .catch(() => setSlotOptions([]));
  }, [service, dateKey]);

  const calendarDays = useMemo(() => {
    const start = parse(monthStart, "yyyy-MM-dd", new Date());
    return Array.from({ length: 35 }, (_, i) => {
      const d = addDays(start, i - ((start.getDay() + 6) % 7));
      return format(d, "yyyy-MM-dd");
    });
  }, [monthStart]);

  async function payDeposit() {
    if (!service || !dateKey || !timeHHmm) return;
    setLoading(true);
    setError(null);
    try {
      const holdRes = await fetch("/api/bookings/hold", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: service.id,
          dateKey,
          timeHHmm,
          guestName: guestName.trim(),
          guestEmail: guestEmail.trim(),
          guestPhone: guestPhone.trim() || undefined,
          notes: notes.trim() || undefined,
        }),
      });
      const hold = await holdRes.json();
      if (!holdRes.ok) throw new Error(hold.error ?? t("errors.reserve"));

      const checkoutRes = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: hold.bookingId }),
      });
      const checkout = await checkoutRes.json();
      if (!checkoutRes.ok) throw new Error(checkout.error ?? t("errors.checkout"));
      if (checkout.url) {
        window.location.href = checkout.url;
        return;
      }
      throw new Error(t("errors.noUrl"));
    } catch (e) {
      setError(e instanceof Error ? e.message : t("errors.generic"));
      setLoading(false);
    }
  }

  const weekdayKeys = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

  return (
    <div className="fixed inset-0 z-[60] flex h-dvh w-screen flex-col bg-cream">
      <div className="relative flex shrink-0 items-center justify-between border-b border-ink/10 px-5 py-4 sm:px-8">
        <div>
          <p className="section-label">{t("label")}</p>
          <h1 className="mt-1 font-serif text-2xl font-medium text-ink sm:text-3xl">
            {t("title")}
          </h1>
        </div>
        <button
          type="button"
          aria-label={t("closeAria")}
          onClick={() => setConfirmClose(true)}
          className="flex h-11 w-11 shrink-0 items-center justify-center text-ink/50 transition-colors hover:text-ink"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {confirmClose ? (
        <div
          className="absolute inset-0 z-20 flex items-center justify-center bg-charcoal/45 px-5"
          role="dialog"
          aria-modal="true"
          aria-labelledby="close-booking-title"
        >
          <div className="w-full max-w-md border border-ink/10 bg-cream p-6 shadow-[0_18px_40px_rgba(27,17,12,0.18)] sm:p-8">
            <p className="section-label">{t("leave.label")}</p>
            <h2 id="close-booking-title" className="mt-3 font-serif text-2xl font-medium text-ink">
              {t("leave.title")}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              {t("leave.body")}
            </p>
            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                className="btn-outline"
                onClick={() => setConfirmClose(false)}
              >
                {t("leave.keep")}
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={() => router.push("/")}
              >
                {t("leave.confirm")}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mx-auto w-full max-w-3xl flex-1 overflow-y-auto px-5 py-8 lg:px-8">
      <p className="text-sm text-muted">
        {t("intro")}
      </p>

      <ol className="mt-8 flex flex-wrap gap-2 text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-ink/40">
        {(["service", "date", "time", "details", "review"] as Step[]).map((s) => (
          <li key={s} className={step === s ? "text-copper" : ""}>
            {t(`steps.${s}`)}
          </li>
        ))}
      </ol>

      {error && (
        <p className="mt-6 border border-copper/30 bg-cream-deep px-4 py-3 text-sm text-copper">
          {error}
        </p>
      )}

      {step === "service" && (
        <div className="mt-8 space-y-2">
          {servicesLoading ? (
            <p className="text-sm text-muted">{t("service.loading")}</p>
          ) : services.length === 0 ? (
            <div className="border border-ink/10 bg-white px-4 py-5">
              <p className="text-sm text-muted">{t("service.empty")}</p>
              <button
                type="button"
                className="btn-outline mt-4"
                onClick={() => void loadServices()}
              >
                {t("service.retry")}
              </button>
            </div>
          ) : (
            services.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setService(s);
                  setStep("date");
                }}
                className="flex w-full items-baseline justify-between gap-4 border border-ink/10 bg-white px-4 py-4 text-left transition hover:border-copper"
              >
                <div className="min-w-0">
                  <p className="font-serif text-sm tracking-wide uppercase">{s.title}</p>
                  <p className="mt-1 text-xs text-muted">{s.description}</p>
                </div>
                <p className="shrink-0 text-right text-xs text-copper">
                  {t("service.durationPrice", { duration: s.durationMin })}
                  <br />
                  {t("service.priceDeposit", {
                    price: formatEur(s.priceCents),
                    deposit: formatEur(s.depositCents),
                  })}
                </p>
              </button>
            ))
          )}
        </div>
      )}

      {step === "date" && service && (
        <div className="mt-8">
          <button type="button" className="text-xs text-copper" onClick={() => setStep("service")}>
            {tCommon("back", { label: service.title })}
          </button>
          <div className="mt-4 flex items-center justify-between">
            <button
              type="button"
              className="text-sm"
              onClick={() => {
                const d = parse(monthStart, "yyyy-MM-dd", new Date());
                setMonthStart(format(new Date(d.getFullYear(), d.getMonth() - 1, 1), "yyyy-MM-dd"));
              }}
            >
              ‹
            </button>
            <p className="font-serif text-lg">
              {format(parse(monthStart, "yyyy-MM-dd", new Date()), "MMMM yyyy")}
            </p>
            <button
              type="button"
              className="text-sm"
              onClick={() => {
                const d = parse(monthStart, "yyyy-MM-dd", new Date());
                setMonthStart(format(new Date(d.getFullYear(), d.getMonth() + 1, 1), "yyyy-MM-dd"));
              }}
            >
              ›
            </button>
          </div>
          {daysLoading ? (
            <p className="mt-6 text-sm text-muted">{t("date.loading")}</p>
          ) : null}
          <p className="mt-4 text-xs text-muted">
            {t("date.hint")}
          </p>
          <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[0.65rem] uppercase tracking-wider text-muted">
            {weekdayKeys.map((d) => (
              <div key={d}>{t(`date.weekdays.${d}`)}</div>
            ))}
            {calendarDays.map((day) => {
              const available = availableDays.includes(day);
              const selected = dateKey === day;
              const meta = dayMetaByDate[day];
              const title = meta
                ? t("date.dayTitle", {
                    booked: meta.booked,
                    capacity: meta.capacity || "–",
                    slots: meta.slots,
                  })
                : undefined;
              return (
                <button
                  key={day}
                  type="button"
                  title={title}
                  disabled={!available || daysLoading}
                  onClick={() => {
                    setDateKey(day);
                    setTimeHHmm(null);
                    setStep("time");
                  }}
                  className={`aspect-square text-sm transition-colors ${dayHeatClass(meta, available, selected)}`}
                >
                  {format(parse(day, "yyyy-MM-dd", new Date()), "d")}
                </button>
              );
            })}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-[0.65rem] uppercase tracking-wider text-muted">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-3 w-3 bg-white ring-1 ring-ink/10" /> {t("date.legend.open")}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-3 w-3 bg-sand/70" /> {t("date.legend.light")}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-3 w-3 bg-copper/25" /> {t("date.legend.busy")}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-3 w-3 bg-copper/70" /> {t("date.legend.nearlyFull")}
            </span>
          </div>
          {!daysLoading && !availableDays.length ? (
            <p className="mt-4 text-sm text-muted">
              {t("date.empty")}
            </p>
          ) : null}
        </div>
      )}

      {step === "time" && service && dateKey && (
        <div className="mt-8">
          <button type="button" className="text-xs text-copper" onClick={() => setStep("date")}>
            {tCommon("back", { label: dateKey })}
          </button>
          <p className="mt-3 text-xs text-muted">
            {t("time.hint")}
          </p>
          <div className="mt-6 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {slotOptions.map((slot) => {
              const selected = timeHHmm === slot.time;
              return (
                <button
                  key={slot.time}
                  type="button"
                  disabled={!slot.available}
                  title={
                    slot.reason === "busy"
                      ? t("time.unavailable")
                      : slot.reason === "past"
                        ? t("time.tooSoon")
                        : undefined
                  }
                  onClick={() => {
                    if (!slot.available) return;
                    setTimeHHmm(slot.time);
                    setStep("details");
                  }}
                  className={`border px-3 py-3 text-sm transition-colors ${
                    selected
                      ? "border-copper bg-copper text-white"
                      : slot.available
                        ? "border-ink/10 bg-white text-ink hover:border-copper/40"
                        : "cursor-not-allowed border-transparent bg-ink/[0.04] text-ink/25 line-through"
                  }`}
                >
                  {slot.time}
                </button>
              );
            })}
            {!slotOptions.length && (
              <p className="col-span-full text-sm text-muted">{t("time.none")}</p>
            )}
            {slotOptions.length > 0 && !slotOptions.some((s) => s.available) && (
              <p className="col-span-full text-sm text-muted">{t("time.noneOpen")}</p>
            )}
          </div>
        </div>
      )}

      {step === "details" && (
        <div className="mt-8 space-y-4">
          <button type="button" className="text-xs text-copper" onClick={() => setStep("time")}>
            {tCommon("back", { label: t("details.changeTime") })}
          </button>
          <label className="block text-xs uppercase tracking-wider text-muted">
            {t("details.fullName")}
            <input
              className="mt-1 w-full border border-ink/15 bg-white px-3 py-3 text-sm text-ink"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              required
            />
          </label>
          <label className="block text-xs uppercase tracking-wider text-muted">
            {t("details.email")}
            <input
              type="email"
              className="mt-1 w-full border border-ink/15 bg-white px-3 py-3 text-sm text-ink"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              required
            />
          </label>
          <label className="block text-xs uppercase tracking-wider text-muted">
            {t("details.phone")}
            <input
              className="mt-1 w-full border border-ink/15 bg-white px-3 py-3 text-sm text-ink"
              value={guestPhone}
              onChange={(e) => setGuestPhone(e.target.value)}
            />
          </label>
          <label className="block text-xs uppercase tracking-wider text-muted">
            {t("details.notes")}
            <textarea
              className="mt-1 w-full border border-ink/15 bg-white px-3 py-3 text-sm text-ink"
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </label>
          <button
            type="button"
            className="btn-primary"
            disabled={guestName.trim().length < 2 || !guestEmail.includes("@")}
            onClick={() => setStep("review")}
          >
            {t("details.reviewCta")}
          </button>
        </div>
      )}

      {step === "review" && service && dateKey && timeHHmm && (
        <div className="mt-8 border border-ink/10 bg-white p-6">
          <h2 className="font-serif text-xl">{service.title}</h2>
          <p className="mt-2 text-sm text-muted">
            {t("review.when", {
              date: dateKey,
              time: timeHHmm,
              duration: service.durationMin,
            })}
          </p>
          <p className="mt-4 text-sm">
            {guestName} · {guestEmail}
            {guestPhone ? ` · ${guestPhone}` : ""}
          </p>
          <div className="mt-6 space-y-1 text-sm">
            <p>{t("review.serviceTotal", { price: formatEur(service.priceCents) })}</p>
            <p className="text-copper">
              {t("review.depositDue", { deposit: formatEur(service.depositCents) })}
            </p>
            <p>
              {t("review.balanceInSalon", {
                balance: formatEur(service.priceCents - service.depositCents),
              })}
            </p>
          </div>
          {process.env.NEXT_PUBLIC_PAYMENT_DEV_MODE === "true" ? (
            <p className="mt-4 text-xs font-medium uppercase tracking-wider text-copper">
              {t("review.devMode")}
            </p>
          ) : null}
          <p className="mt-4 text-xs text-muted">
            {t("review.cancellation")}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" className="btn-outline" onClick={() => setStep("details")}>
              {t("review.editDetails")}
            </button>
            <button type="button" className="btn-primary" disabled={loading} onClick={payDeposit}>
              {loading
                ? t("review.confirming")
                : process.env.NEXT_PUBLIC_PAYMENT_DEV_MODE === "true"
                  ? t("review.confirmTest")
                  : t("review.payDeposit")}
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
