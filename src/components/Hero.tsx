import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function Hero() {
  const t = await getTranslations("home.hero");

  return (
    <section id="home" className="relative flex min-h-0 flex-1 overflow-hidden bg-cream">
      {/* Full-bleed photo */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 flex flex-row">
          <div className="hidden flex-1 lg:block" />
          <div className="relative min-h-0 w-full flex-[1.35] lg:flex-[2]">
            <Image
              src="/images/hero-banner.jpg"
              alt={t("imageAlt")}
              fill
              priority
              className="object-cover object-[50%_18%] lg:object-[38%_22%] lg:origin-left"
              sizes="100vw"
            />
          </div>
        </div>

        {/* Mobile: stronger dark fade so light type pops */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/55 to-black/92 lg:hidden" />
        {/* Desktop: cream wash for left copy */}
        <div
          className="absolute inset-0 hidden lg:block"
          style={{
            background:
              "linear-gradient(90deg, var(--cream) 0%, var(--cream) 32%, color-mix(in srgb, var(--cream) 88%, transparent) 44%, color-mix(in srgb, var(--cream) 35%, transparent) 56%, transparent 68%)",
          }}
        />
      </div>

      <div className="relative z-10 flex h-full w-full flex-col px-6 pb-5 pt-6 sm:px-10 lg:w-[48%] lg:justify-between lg:px-12 lg:py-6 xl:px-16 xl:pl-[max(2.5rem,calc((100vw-80rem)/2+2.5rem))]">
        <div className="min-h-[22%] shrink-0 lg:hidden" aria-hidden />

        <div className="flex min-h-0 flex-1 flex-col items-center justify-end pb-10 text-center lg:items-start lg:justify-center lg:pb-0 lg:text-left">
          <div className="flex w-full max-w-[28rem] flex-col items-center lg:items-start">
            <p className="section-label animate-fade-up text-copper-soft lg:text-copper">
              {t("label")}
            </p>

            <h1 className="animate-fade-up delay-100 mt-4 font-serif text-[2.15rem] leading-[1.1] font-medium tracking-[-0.01em] text-cream sm:text-[2.5rem] lg:text-[clamp(2.5rem,4.2vh+1.2rem,3.35rem)] lg:text-ink">
              {t("titleLine1")}
              <br />
              {t("titleLine2")}
              <br />
              <span className="script text-[1.05em] leading-none text-copper-soft lg:text-copper">
                {t("titleScript")}
              </span>
            </h1>

            <p className="animate-fade-up delay-200 mt-4 max-w-[22rem] text-[0.88rem] leading-[1.65] text-cream/80 sm:mt-5 sm:text-[0.9rem] lg:max-w-none lg:text-muted">
              {t("subtitle")}
            </p>

            <div className="animate-fade-up delay-300 mt-6 flex w-full max-w-[20rem] flex-col items-stretch gap-3 sm:mt-8 lg:max-w-none lg:flex-row lg:items-center">
              <Link
                href="/book"
                className="btn-primary shrink-0 bg-copper-soft hover:bg-copper lg:bg-copper lg:hover:bg-copper-hover"
              >
                {t("ctaBook")}
                <CalendarIcon />
              </Link>
              <Link
                href="/lookbook"
                className="inline-flex shrink-0 items-center justify-center border border-cream/85 px-[1.6rem] py-[0.9rem] text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-cream transition-colors hover:bg-cream/10 lg:border-copper lg:bg-cream/50 lg:text-copper lg:hover:bg-copper lg:hover:text-white"
              >
                {t("ctaLookbook")}
              </Link>
            </div>
          </div>
        </div>

        <a
          href="#experience"
          className="animate-fade-up delay-400 z-10 mx-0 hidden items-center justify-start gap-3 self-start text-[0.6rem] font-medium uppercase tracking-[0.22em] text-ink/45 transition-colors hover:text-copper lg:inline-flex"
        >
          <span className="animate-scroll inline-flex text-copper" aria-hidden>
            ↓
          </span>
          {t("scroll")}
        </a>
      </div>
    </section>
  );
}

function CalendarIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="5" width="18" height="16" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 9h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
