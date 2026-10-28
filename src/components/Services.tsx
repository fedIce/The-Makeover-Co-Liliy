import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { marketingServices } from "@/data/services";
import { Link } from "@/i18n/navigation";
import { formatEur } from "@/lib/money";

export default async function Services() {
  const t = await getTranslations("home.services");

  return (
    <section id="services" className="bg-cream py-20 lg:py-24">
      <div className="container-site">
        <div className="mx-auto max-w-2xl text-center">
          <p className="section-label">{t("label")}</p>
          <h2 className="mt-4 font-serif text-[1.85rem] font-medium text-ink sm:text-[2.35rem]">
            {t("title")}
          </h2>
        </div>

        <div
          id="pricing"
          className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 xl:gap-4"
        >
          {marketingServices.map((service) => (
            <article key={service.slug} className="group flex flex-col bg-white">
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                  src={service.image}
                  alt={t(`items.${service.slug}.title`)}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  sizes="(max-width: 1280px) 33vw, 16vw"
                />
              </div>
              <div className="flex flex-1 flex-col px-3.5 pt-4 pb-5">
                <h3 className="font-serif text-[0.72rem] font-semibold tracking-[0.08em] text-ink uppercase">
                  {t(`items.${service.slug}.title`)}
                </h3>
                <p className="mt-2 text-[0.75rem] leading-relaxed text-muted">
                  {t(`items.${service.slug}.description`)}
                </p>
                <p className="mt-3 text-[0.7rem] font-semibold tracking-[0.08em] text-copper uppercase">
                  {t("fromPrice", { price: formatEur(service.priceCents) })}
                </p>
                <Link
                  href={`/book?service=${service.slug}`}
                  className="mt-3 inline-flex items-center gap-1 text-[0.62rem] font-semibold tracking-[0.14em] text-ink uppercase transition-colors hover:text-copper"
                >
                  {t("bookNow")} <span aria-hidden>→</span>
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/services" className="btn-outline">
            {t("viewAll")}
          </Link>
        </div>
      </div>
    </section>
  );
}
