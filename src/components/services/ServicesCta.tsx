import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function ServicesCta() {
  const t = await getTranslations("services.cta");

  return (
    <section className="relative overflow-hidden bg-cream-deep py-14 lg:py-16">
      <div className="container-site relative grid items-center gap-10 lg:grid-cols-[auto_1.4fr_auto] lg:gap-12">
        {/* Left inset photo — rectangular, matching mockup */}
        <div className="relative mx-auto h-28 w-36 overflow-hidden sm:h-32 sm:w-44 lg:mx-0">
          <Image
            src="https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=500&q=80"
            alt=""
            fill
            className="object-cover"
            sizes="176px"
          />
        </div>

        <div className="text-center">
          <h2 className="font-serif text-[1.85rem] font-medium tracking-tight text-ink sm:text-[2.2rem]">
            {t("title")}
          </h2>
          <p className="script mt-3 text-[1.5rem] leading-snug sm:text-[1.75rem]">
            {t("script")}
          </p>
        </div>

        <div className="text-center lg:text-right">
          <Link href="/book" className="btn-primary inline-flex whitespace-nowrap">
            {t("button")}
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
      <path
        d="M7 8V7a5 5 0 0110 0v1M5 8h14l-1 12H6L5 8z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
