import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import BeforeAfter from "./BeforeAfter";

export default async function Experience() {
  const t = await getTranslations("home.experience");

  return (
    <section id="experience" className="relative overflow-hidden bg-cream py-20 lg:py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-8 -right-10 hidden w-64 opacity-[0.18] lg:block xl:w-80"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1606041008023-472dfb5e530f?auto=format&fit=crop&w=600&q=60')",
          backgroundSize: "cover",
          backgroundPosition: "left center",
          maskImage: "linear-gradient(to left, black, transparent)",
          WebkitMaskImage: "linear-gradient(to left, black, transparent)",
        }}
      />

      <div className="container-site relative grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <BeforeAfter />

        <div className="max-w-md lg:pl-2">
          <p className="section-label">{t("label")}</p>
          <h2 className="mt-5 font-serif text-[1.85rem] leading-[1.2] font-medium text-ink sm:text-[2.25rem] lg:text-[2.5rem]">
            {t("titleLine1")}
            <br />
            {t("titleLine2")}
          </h2>
          <p className="script mt-3 text-[1.85rem] leading-none sm:text-[2.15rem]">
            {t("script")}
          </p>
          <p className="mt-6 text-[0.9rem] leading-[1.75] text-muted">{t("body")}</p>
          <Link href="/#about" className="btn-primary mt-9 inline-flex">
            {t("cta")}
          </Link>
        </div>
      </div>
    </section>
  );
}
