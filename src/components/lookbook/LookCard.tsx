import Image from "next/image";
import { getTranslations } from "next-intl/server";

type LookCardProps = {
  styleId: string;
  image: string;
  href?: string;
  tone?: "light" | "dark";
  className?: string;
  /** Overlay style: text sits on image. Panel: text on solid colour, image beside/behind. */
  variant?: "panel" | "overlay";
  /** Fade from the colour panel into the photo (panel variant). */
  imageFade?: boolean;
};

export default async function LookCard({
  styleId,
  image,
  href = "#",
  tone = "dark",
  className = "",
  variant = "panel",
  imageFade = true,
}: LookCardProps) {
  const t = await getTranslations("lookbook");
  const title = t(`styles.${styleId}.title`);
  const description = t(`styles.${styleId}.description`);
  const viewLooks = t("viewLooks");
  const isDark = tone === "dark";

  if (variant === "overlay") {
    return (
      <article className={`group relative flex min-h-[16rem] flex-col justify-end overflow-hidden ${className}`}>
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            sizes="(max-width: 1024px) 50vw, 20vw"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/25 to-transparent" />
        <div className="relative z-10 p-4 sm:p-5">
          <h3 className="font-serif text-[0.85rem] tracking-[0.08em] text-cream uppercase sm:text-[0.95rem]">
            {title}
          </h3>
          <p className="mt-2 max-w-[11rem] text-[0.72rem] leading-relaxed text-cream/75">
            {description}
          </p>
          <a
            href={href}
            className="mt-3 inline-flex items-center gap-1 text-[0.58rem] font-semibold tracking-[0.14em] text-cream uppercase transition-colors hover:text-copper"
          >
            {viewLooks} <span aria-hidden>→</span>
          </a>
        </div>
      </article>
    );
  }

  return (
    <article
      className={`group relative flex min-h-[20rem] overflow-hidden sm:min-h-[24rem] ${className} ${
        isDark ? "bg-charcoal text-cream" : "bg-sand text-ink"
      }`}
    >
      <div
        className={`relative z-10 flex w-[42%] shrink-0 flex-col justify-center px-5 py-8 sm:w-[40%] sm:px-7 lg:px-8 ${
          isDark ? "bg-charcoal" : "bg-sand"
        }`}
      >
        <h3 className="font-serif text-[1.05rem] leading-snug tracking-[0.06em] uppercase sm:text-[1.25rem]">
          {title}
        </h3>
        <span className={`hairline mt-4 ${isDark ? "bg-cream" : "bg-ink"}`} />
        <p className={`mt-4 max-w-[14rem] text-[0.8rem] leading-relaxed ${isDark ? "text-cream/70" : "text-muted"}`}>
          {description}
        </p>
        <a
          href={href}
          className={`mt-6 inline-flex items-center gap-1 text-[0.6rem] font-semibold tracking-[0.14em] uppercase transition-opacity hover:opacity-70 ${
            isDark ? "text-cream" : "text-ink"
          }`}
        >
          {viewLooks} <span aria-hidden>→</span>
        </a>
      </div>

      <div className="relative min-w-0 flex-1 overflow-hidden self-stretch">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          sizes="(max-width: 768px) 60vw, 40vw"
        />
        {imageFade ? (
          isDark ? (
            <div className="absolute inset-0 bg-gradient-to-r from-charcoal via-charcoal/55 to-transparent" />
          ) : (
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(90deg, var(--sand) 0%, color-mix(in srgb, var(--sand) 55%, transparent) 8%, transparent 20%)",
              }}
            />
          )
        ) : null}
      </div>
    </article>
  );
}
