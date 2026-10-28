import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function LookbookHero() {
  const t = await getTranslations("lookbook.hero");

  return (
    <section className="relative overflow-hidden bg-cream pt-[var(--header-h)]">
      {/* Desktop: image height drives the section (1024×576) */}
      <div className="relative hidden lg:block">
        <div className="flex flex-row items-stretch">
          <div className="flex-1 bg-cream" />
          <div className="relative w-full flex-[2]">
            <Image
              src="/images/lookbook-hero.jpg"
              alt={t("imageAlt")}
              width={1024}
              height={576}
              priority
              className="h-auto w-full"
              sizes="66vw"
            />
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "linear-gradient(90deg, var(--cream) 0%, color-mix(in srgb, var(--cream) 55%, transparent) 8%, transparent 20%)",
              }}
            />
          </div>
        </div>

        <div className="absolute inset-0 z-10 flex items-center px-6 sm:px-10 lg:w-[48%] lg:px-12 xl:pl-[max(2.5rem,calc((100vw-80rem)/2+2.5rem))]">
          <div className="animate-fade-up max-w-[26rem]">
            <p className="section-label">{t("label")}</p>
            <span className="hairline mt-3 bg-copper" />
            <h1 className="mt-5 font-serif text-[2.4rem] leading-[1.08] font-medium tracking-tight text-ink sm:text-[2.9rem] lg:text-[3.15rem]">
              {t("titleLine1")}
              <br />
              {t("titleLine2")}
            </h1>
            <p className="script mt-3 text-[1.75rem] leading-[1.05] sm:text-[2rem]">
              {t("script")}
            </p>
            <span className="mt-5 block h-px w-16 bg-ink/25" />
            <p className="mt-5 max-w-[21rem] text-[0.88rem] leading-[1.75] text-muted">
              {t("body")}
            </p>
            <Link href="/book" className="btn-outline mt-7 inline-flex">
              {t("cta")}
              <BagIcon />
            </Link>
          </div>
        </div>

        <div className="absolute right-0 bottom-8 z-10 px-6 lg:bottom-10 lg:px-12 xl:pr-[max(2.5rem,calc((100vw-80rem)/2+2.5rem))]">
          <div className="ml-auto max-w-[13.5rem] text-right">
            <p className="script text-[1.5rem] leading-snug text-copper sm:text-[1.7rem]">
              {t("sideScriptLine1")}
              <br />
              {t("sideScriptLine2")}
            </p>
            <span className="ml-auto mt-3 block h-px w-10 bg-copper/70" />
            <p className="mt-2.5 font-serif text-[0.9rem] tracking-[0.12em] text-ink uppercase">
              {t("bridalLooks")}
            </p>
            <a
              href="#styles"
              className="mt-2 inline-flex items-center gap-1 text-[0.62rem] font-semibold tracking-[0.16em] text-ink uppercase transition-colors hover:text-copper"
            >
              {t("viewCollection")} <span aria-hidden>→</span>
            </a>
          </div>
        </div>
      </div>

      {/* Mobile: copy only (no banner photo) */}
      <div className="px-6 py-12 sm:px-10 lg:hidden">
        <div className="animate-fade-up max-w-[26rem]">
          <p className="section-label">{t("label")}</p>
          <span className="hairline mt-3 bg-copper" />
          <h1 className="mt-5 font-serif text-[2.4rem] leading-[1.08] font-medium tracking-tight text-ink sm:text-[2.9rem]">
            {t("titleLine1")}
            <br />
            {t("titleLine2")}
          </h1>
          <p className="script mt-3 text-[1.75rem] leading-[1.05] sm:text-[2rem]">
            {t("script")}
          </p>
          <span className="mt-5 block h-px w-16 bg-ink/25" />
          <p className="mt-5 max-w-[21rem] text-[0.88rem] leading-[1.75] text-muted">
            {t("body")}
          </p>
          <Link href="/book" className="btn-outline mt-7 inline-flex">
            {t("cta")}
            <BagIcon />
          </Link>
        </div>
      </div>
    </section>
  );
}

function BagIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M7 8V7a5 5 0 0110 0v1M5 8h14l-1 12H6L5 8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}
