import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

const images = [
  "/images/services/unlimited-blonding.jpg",
  "/images/services/balayage-highlights.jpg",
  "/images/services/colour-correction.jpg",
  "/images/services/gloss-toner.jpg",
  "/images/services/hair-botox.jpg",
  "/images/services/hair-extensions.jpg",
];

export default async function Instagram() {
  const t = await getTranslations("home.instagram");

  return (
    <section className="bg-cream py-16 lg:py-20">
      <div className="container-site">
        <div className="mb-8 flex items-center gap-2.5">
          <InstagramIcon />
          <p className="text-[0.68rem] font-semibold tracking-[0.22em] text-ink uppercase">
            {t("label")}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 lg:gap-2">
          {images.map((src, i) => (
            <a
              key={src}
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className={`group relative aspect-square overflow-hidden ${i >= 4 ? "hidden sm:block" : ""} ${i >= 5 ? "md:block" : ""}`}
            >
              <Image
                src={src}
                alt={t("imageAlt", { n: i + 1 })}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 1024px) 25vw, 14vw"
              />
            </a>
          ))}
          <Link
            href="/lookbook"
            className="flex aspect-square items-center justify-center bg-cream-deep px-3 text-center transition-colors hover:bg-sand"
          >
            <span className="text-[0.6rem] font-semibold tracking-[0.14em] text-ink uppercase">
              {t("viewMore")}
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}

function InstagramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-copper" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  );
}
