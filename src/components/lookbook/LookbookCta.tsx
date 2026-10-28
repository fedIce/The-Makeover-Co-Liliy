import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function LookbookCta() {
  const t = await getTranslations("lookbook.cta");

  return (
    <section className="relative overflow-hidden bg-cream py-16 lg:py-20">
      <div className="container-site relative grid items-center gap-10 lg:grid-cols-[0.9fr_1.3fr_1fr] lg:gap-8">
        {/* Polaroids */}
        <div className="relative hidden h-36 sm:block lg:h-40">
          <div className="absolute top-0 left-0 text-copper">
            <InstagramIcon />
          </div>
          <div className="absolute top-8 left-2 h-[7.5rem] w-[5.75rem] -rotate-6 overflow-hidden border-[5px] border-white shadow-md">
            <Image
              src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=300&q=80"
              alt=""
              fill
              className="object-cover"
              sizes="92px"
            />
          </div>
          <div className="absolute top-4 left-16 h-[7.5rem] w-[5.75rem] rotate-[5deg] overflow-hidden border-[5px] border-white shadow-md">
            <Image
              src="https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?auto=format&fit=crop&w=300&q=80"
              alt=""
              fill
              className="object-cover"
              sizes="92px"
            />
          </div>
        </div>

        {/* Center copy */}
        <div className="text-center lg:px-4">
          <p className="script text-[1.85rem] leading-snug text-copper sm:text-[2.25rem] lg:text-[2.45rem]">
            {t("script")}
          </p>
          <p className="mt-3 text-[0.95rem] text-ink sm:text-base">
            {t("body")}
          </p>
        </div>

        {/* CTA — above corner photo */}
        <div className="relative z-20 text-center lg:text-right">
          <Link href="/book" className="btn-primary inline-flex">
            {t("button")}
            <BagIcon />
          </Link>
          <p className="mt-3 text-[0.7rem] text-muted">
            {t("note")}
          </p>
        </div>
      </div>

      <div className="pointer-events-none absolute right-0 bottom-0 z-0 hidden h-40 w-48 opacity-70 lg:block xl:h-48 xl:w-56">
        <Image
          src="https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=500&q=70"
          alt=""
          fill
          className="object-cover object-left"
          sizes="224px"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent to-cream" />
      </div>
    </section>
  );
}

function InstagramIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M7 8V7a5 5 0 0110 0v1M5 8h14l-1 12H6L5 8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}
