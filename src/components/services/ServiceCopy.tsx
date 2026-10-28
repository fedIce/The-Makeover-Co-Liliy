import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function ServiceCopy({
  id,
  href,
  tone = "light",
  compact = false,
}: {
  id: string;
  href: string;
  tone?: "light" | "dark";
  compact?: boolean;
}) {
  const t = await getTranslations(`services.blocks.${id}`);
  const tServices = await getTranslations("services");
  const dark = tone === "dark";

  return (
    <div
      className={`flex h-full flex-col justify-center ${
        compact ? "px-6 py-8 sm:px-7" : "px-7 py-11 sm:px-9 lg:px-10"
      } ${dark ? "text-cream" : "text-ink"}`}
    >
      <p
        className={`text-[0.62rem] font-semibold tracking-[0.24em] ${
          dark ? "text-copper-soft" : "text-copper"
        }`}
      >
        {t("number")}
      </p>
      <h2
        className={`mt-2.5 font-serif font-medium tracking-tight ${
          compact ? "text-[1.45rem] sm:text-[1.6rem]" : "text-[1.7rem] sm:text-[1.9rem]"
        }`}
      >
        {t("title")}
      </h2>
      <p
        className={`script mt-2 leading-snug ${
          compact ? "text-[1.2rem] sm:text-[1.35rem]" : "text-[1.35rem] sm:text-[1.5rem]"
        } ${dark ? "text-copper-soft" : ""}`}
      >
        {t("tagline")}
      </p>
      <p
        className={`mt-3.5 max-w-sm leading-[1.7] ${
          compact ? "text-[0.78rem]" : "text-[0.84rem]"
        } ${dark ? "text-cream/65" : "text-muted"}`}
      >
        {t("body")}
      </p>
      <Link
        href={href}
        className={`mt-5 inline-flex w-fit items-center gap-1.5 text-[0.6rem] font-semibold tracking-[0.18em] uppercase transition-colors ${
          dark ? "text-cream hover:text-copper-soft" : "text-ink hover:text-copper"
        }`}
      >
        {tServices("discover")} <span aria-hidden>→</span>
      </Link>
    </div>
  );
}
