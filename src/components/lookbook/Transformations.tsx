"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import {
  ReactCompareSlider,
  ReactCompareSliderImage,
} from "react-compare-slider";

const pairs = [
  {
    key: "softWaves",
    before: "/images/lookbook/transform-soft-waves-before.jpg",
    after: "/images/lookbook/transform-soft-waves-after.jpg",
  },
  {
    key: "brunetteGloss",
    before: "/images/lookbook/transform-brunette-gloss-before.jpg",
    after: "/images/lookbook/transform-brunette-gloss-after.jpg",
  },
  {
    key: "colourRefresh",
    before: "/images/lookbook/transform-colour-refresh-before.jpg",
    after: "/images/lookbook/transform-colour-refresh-after.jpg",
  },
  {
    key: "copperGlow",
    before: "/images/lookbook/transform-copper-glow-before.jpg",
    after: "/images/lookbook/transform-copper-glow-after.jpg",
  },
] as const;

export default function Transformations() {
  const t = useTranslations("lookbook.transformations");
  const [index, setIndex] = useState(0);

  const windowPairs = [
    pairs[index % pairs.length],
    pairs[(index + 1) % pairs.length],
    pairs[(index + 2) % pairs.length],
  ];

  return (
    <section className="bg-charcoal py-16 text-cream lg:py-20">
      <div className="container-site grid items-center gap-10 lg:grid-cols-[0.7fr_1.8fr] lg:gap-12">
        <div>
          <h2 className="font-serif text-[1.55rem] leading-snug font-medium tracking-[0.04em] text-copper-soft uppercase sm:text-[1.75rem]">
            {t("titleLine1")}
            <br />
            {t("titleLine2")}
          </h2>
          <span className="hairline mt-5 bg-copper-soft" />
          <p className="mt-5 max-w-xs text-[0.88rem] leading-relaxed text-cream/65">
            {t("body")}
          </p>
          <a
            href="#styles"
            className="mt-7 inline-flex items-center gap-1 text-[0.62rem] font-semibold tracking-[0.16em] text-copper-soft uppercase transition-opacity hover:opacity-70"
          >
            {t("seeAll")} <span aria-hidden>→</span>
          </a>
        </div>

        <div className="relative">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-3">
            {windowPairs.map((pair, i) => {
              const label = t(`pairs.${pair.key}`);
              return (
                <div key={`${pair.key}-${i}`} className={i > 0 ? "hidden sm:block" : ""}>
                  <div className="aspect-[3/4] overflow-hidden">
                    <ReactCompareSlider
                      className="h-full w-full"
                      defaultPosition={50}
                      handle={
                        <div className="relative flex h-full items-center justify-center">
                          <div className="h-full w-px bg-white/85" />
                          <div className="absolute flex h-7 w-7 items-center justify-center rounded-full border border-white bg-white text-ink shadow">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden>
                              <path d="M8 6l-5 6 5 6M16 6l5 6-5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                          </div>
                        </div>
                      }
                      itemOne={
                        <ReactCompareSliderImage
                          src={pair.before}
                          alt={t("beforeAlt", { label })}
                          style={{ objectFit: "cover" }}
                        />
                      }
                      itemTwo={
                        <ReactCompareSliderImage
                          src={pair.after}
                          alt={t("afterAlt", { label })}
                          style={{ objectFit: "cover" }}
                        />
                      }
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setIndex((i) => (i + 1) % pairs.length)}
            aria-label={t("nextAria")}
            className="absolute top-1/2 -right-2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-cream/30 text-cream transition hover:border-copper hover:text-copper sm:flex lg:-right-4"
          >
            ›
          </button>
        </div>
      </div>
    </section>
  );
}
