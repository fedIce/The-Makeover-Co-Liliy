import Image from "next/image";
import { getTranslations } from "next-intl/server";

const reviews = [
  {
    key: "andrea",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=160&q=80",
  },
  {
    key: "maria",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80",
  },
  {
    key: "elena",
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&q=80",
  },
] as const;

export default async function Testimonials() {
  const t = await getTranslations("home.testimonials");

  return (
    <section id="reviews" className="relative overflow-hidden bg-cream py-16 lg:py-20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 hidden w-[26%] lg:block"
      >
        <Image
          src="https://images.unsplash.com/photo-1606041008023-472dfb5e530f?auto=format&fit=crop&w=800&q=70"
          alt=""
          fill
          className="object-cover object-left opacity-55"
          sizes="26vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-cream via-cream/70 to-transparent" />
      </div>

      <div className="container-site relative">
        <p className="section-label">{t("label")}</p>

        <div className="mt-10 grid gap-10 md:grid-cols-3 md:gap-8 lg:max-w-[74%]">
          {reviews.map((review) => (
            <blockquote key={review.key} className="flex flex-col">
              <p className="font-serif text-[0.95rem] leading-[1.7] text-ink/80">
                {t(`reviews.${review.key}.text`)}
              </p>
              <div className="mt-4 flex gap-0.5 text-copper" aria-label={t("ratingAria")}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} />
                ))}
              </div>
              <footer className="mt-5 flex items-center gap-3">
                <div className="relative h-9 w-9 overflow-hidden rounded-full">
                  <Image
                    src={review.image}
                    alt={t(`reviews.${review.key}.name`)}
                    fill
                    className="object-cover"
                    sizes="36px"
                  />
                </div>
                <cite className="text-[0.62rem] font-semibold not-italic tracking-[0.16em] text-ink uppercase">
                  — {t(`reviews.${review.key}.name`)}
                </cite>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}

function Star() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 3.5l2.2 5.3 5.8.5-4.4 3.8 1.3 5.6L12 15.8 6.1 18.7l1.3-5.6L3 9.3l5.8-.5L12 3.5z" />
    </svg>
  );
}
