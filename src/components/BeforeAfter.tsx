"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  ReactCompareSlider,
  ReactCompareSliderImage,
} from "react-compare-slider";

export default function BeforeAfter() {
  const t = useTranslations("home.experience");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  return (
    <div className="relative overflow-hidden shadow-[0_18px_40px_rgba(27,17,12,0.12)]">
      {ready ? (
        <ReactCompareSlider
          className="aspect-[4/5] w-full"
          defaultPosition={48}
          handle={
            <div className="relative flex h-full items-center justify-center">
              <div className="h-full w-px bg-white" />
              <div className="absolute flex h-9 w-9 items-center justify-center rounded-full border border-white/90 bg-white text-ink shadow">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M8 6l-5 6 5 6M16 6l5 6-5 6"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          }
          itemOne={
            <ReactCompareSliderImage
              src="/images/before-waves.jpg"
              alt={t("beforeAlt")}
              style={{ objectFit: "cover", objectPosition: "center top" }}
            />
          }
          itemTwo={
            <ReactCompareSliderImage
              src="/images/after-waves.jpg"
              alt={t("afterAlt")}
              style={{ objectFit: "cover", objectPosition: "center top" }}
            />
          }
        />
      ) : (
        <div className="relative aspect-[4/5] w-full">
          <Image
            src="/images/after-waves.jpg"
            alt={t("afterAlt")}
            fill
            className="object-cover object-top"
            sizes="(max-width: 1024px) 100vw, 40vw"
          />
        </div>
      )}
      <span className="pointer-events-none absolute top-3 left-3 z-10 bg-charcoal/65 px-2 py-1 text-[0.55rem] font-semibold tracking-[0.16em] text-white uppercase">
        {t("before")}
      </span>
      <span className="pointer-events-none absolute top-3 right-3 z-10 bg-charcoal/65 px-2 py-1 text-[0.55rem] font-semibold tracking-[0.16em] text-white uppercase">
        {t("after")}
      </span>
    </div>
  );
}
