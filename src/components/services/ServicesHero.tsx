import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function ServicesHero() {
  const t = await getTranslations("services.hero");

  return (
    <section className="relative flex min-h-svh flex-col overflow-hidden bg-cream pt-[var(--header-h)]">
      {/* Banner photo — desktop only, same crop as home */}
      <div className="pointer-events-none absolute inset-0 hidden pt-[var(--header-h)] lg:block">
        <div className="absolute inset-0 flex flex-row">
          <div className="flex-1" />
          <div className="relative min-h-0 w-full flex-[2]">
            <Image
              src="/images/hero-banner.jpg"
              alt={t("imageAlt")}
              fill
              priority
              className="object-cover object-[38%_22%] origin-left"
              sizes="60vw"
            />
          </div>
        </div>
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, var(--cream) 0%, var(--cream) 32%, color-mix(in srgb, var(--cream) 88%, transparent) 44%, color-mix(in srgb, var(--cream) 35%, transparent) 56%, transparent 68%)",
          }}
        />
      </div>

      <div className="relative z-10 flex flex-1 flex-col justify-center px-6 py-12 sm:px-10 lg:w-[48%] lg:px-12 lg:py-10 xl:pl-[max(2.5rem,calc((100vw-80rem)/2+2.5rem))]">
        <div className="animate-fade-up max-w-[26rem]">
          <p className="section-label">{t("label")}</p>
          <h1 className="mt-5 font-serif text-[2.55rem] leading-[1.08] font-medium tracking-tight text-ink sm:text-[3.1rem] lg:text-[3.4rem]">
            {t("titleLine1")}
            <br />
            {t("titleLine2")}
          </h1>
          <p className="script mt-5 text-[1.9rem] leading-[1.05] sm:text-[2.2rem]">
            {t("script")}
          </p>
          <p className="mt-6 max-w-[21rem] text-[0.88rem] leading-[1.75] text-muted">
            {t("body")}
          </p>
          <Link href="/book" className="btn-outline mt-9 inline-flex">
            {t("cta")}
            <BagIcon />
          </Link>
          <p className="script mt-10 flex items-center gap-2.5 text-[1.4rem] leading-none sm:text-[1.55rem]">
            {t("tagline")}
            <HeartIcon />
          </p>
        </div>
      </div>
    </section>
  );
}

function BagIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7 8V7a5 5 0 0110 0v1M5 8h14l-1 12H6L5 8z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="18" height="16" viewBox="0 0 24 22" fill="none" aria-hidden className="shrink-0 text-copper">
      <path
        d="M12 19.5s-6.8-4.1-9.1-7.9C.9 8.4 1.9 4.8 5.1 3.8c1.9-.6 3.9.2 5 1.7 1.1-1.5 3.1-2.3 5-1.7 3.2 1 4.2 4.6 2.2 7.8-2.3 3.8-9.1 7.9-9.1 7.9z"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinejoin="round"
      />
    </svg>
  );
}
