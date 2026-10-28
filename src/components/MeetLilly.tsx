import Image from "next/image";
import { getTranslations } from "next-intl/server";

const pointKeys = [
  { key: "dedicated", icon: UserIcon },
  { key: "blondes", icon: SparkIcon },
  { key: "products", icon: LeafIcon },
  { key: "private", icon: HomeIcon },
] as const;

export default async function MeetLilly() {
  const t = await getTranslations("home.meetLilly");

  return (
    <section id="about" className="bg-charcoal text-cream">
      <div className="grid lg:grid-cols-[0.85fr_1.15fr]">
        <div className="relative min-h-[22rem] sm:min-h-[28rem] lg:min-h-full">
          <Image
            src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80"
            alt={t("imageAlt")}
            fill
            className="object-cover grayscale contrast-[1.05] brightness-[0.82]"
            sizes="(max-width: 1024px) 100vw, 42vw"
          />
        </div>

        <div className="grid gap-10 px-6 py-14 sm:px-10 lg:grid-cols-[1fr_auto_1fr] lg:gap-0 lg:px-12 lg:py-16 xl:px-16 xl:py-20">
          <div className="lg:pr-10">
            <p className="section-label !text-copper">{t("label")}</p>
            <h2 className="mt-5 font-serif text-[1.85rem] leading-snug font-medium text-cream sm:text-[2.25rem]">
              {t("title")}
            </h2>
            <span className="hairline mt-5 bg-copper opacity-80" />
            <p className="mt-6 max-w-sm text-[0.88rem] leading-[1.75] text-cream/70">
              {t("body")}
            </p>
            <p className="mt-8">
              <span className="script text-[1.85rem] text-cream">{t("name")}</span>
              <span className="ml-2 text-copper">♡</span>
            </p>
            <p className="mt-1 text-[0.58rem] font-semibold tracking-[0.2em] text-copper uppercase">
              {t("role")}
            </p>
          </div>

          <div className="hidden w-px self-stretch bg-copper/35 lg:block" aria-hidden />

          <ul className="space-y-7 lg:pl-10">
            {pointKeys.map(({ key, icon: Icon }) => (
              <li key={key} className="flex gap-3.5">
                <span className="mt-0.5 shrink-0 text-copper">
                  <Icon />
                </span>
                <div>
                  <h3 className="text-[0.62rem] font-semibold tracking-[0.16em] text-copper uppercase">
                    {t(`points.${key}.title`)}
                  </h3>
                  <p className="mt-1.5 text-[0.82rem] leading-relaxed text-cream/65">
                    {t(`points.${key}.text`)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function UserIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.2" />
      <path d="M5.5 18.5c1.4-3.2 3.7-4.6 6.5-4.6s5.1 1.4 6.5 4.6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 3.5v3.5M12 17v3.5M4.8 12H8.2M15.8 12h3.4M7 7l2.2 2.2M14.8 14.8L17 17M17 7l-2.2 2.2M9.2 14.8L7 17" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function LeafIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M5.5 18.5C5.5 11.5 11 6 18.5 6c0 7.5-5.5 13-13 13z" stroke="currentColor" strokeWidth="1.2" />
      <path d="M5.5 18.5l6.5-6.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4.5 11l7.5-6.5L19.5 11v8a1 1 0 01-1 1h-4.5v-5h-4v5H5.5a1 1 0 01-1-1v-8z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}
