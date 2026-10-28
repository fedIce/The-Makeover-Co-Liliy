import { getTranslations } from "next-intl/server";
import { servicesPageBlocks } from "@/data/services-page";
import ServiceCopy from "./ServiceCopy";
import ServiceImage from "./ServiceImage";

/**
 * Magazine mosaic matching the services mockup:
 * cream gutters between tiles, uneven column widths, side-by-side quote panels.
 */
export default async function ServicesMosaic() {
  const t = await getTranslations("services.blocks");
  const [blonde, brunette, colour, bridal, health, extensions, cut, finishing] =
    servicesPageBlocks;

  return (
    <section className="w-full bg-cream">
      <div className="flex w-full flex-col gap-1.5 sm:gap-2 lg:gap-2">
        {/* 01 Blonde Atelier — portrait | copy | tall products */}
        <div className="grid gap-1.5 sm:gap-2 lg:grid-cols-[1.05fr_1.15fr_0.95fr] lg:gap-2 lg:min-h-[26rem]">
          <ServiceImage
            src={blonde.images.primary}
            alt={t(`${blonde.id}.primaryAlt`)}
            className="min-h-[18rem] aspect-[4/5] lg:aspect-auto lg:min-h-full"
            objectPosition="object-[50%_22%]"
          />
          <div className="bg-cream-deep">
            <ServiceCopy id={blonde.id} href={blonde.href} />
          </div>
          <ServiceImage
            src={blonde.images.secondary!}
            alt={t(`${blonde.id}.secondaryAlt`)}
            className="min-h-[16rem] aspect-[3/4] lg:aspect-auto lg:min-h-full"
            objectPosition="object-[50%_55%]"
          />
        </div>

        {/* 02 Brunette Studio — copy | wide landscape */}
        <div className="grid gap-1.5 sm:gap-2 lg:grid-cols-[0.9fr_1.55fr] lg:gap-2 lg:min-h-[22rem]">
          <div className="bg-[#ebe0d4]">
            <ServiceCopy id={brunette.id} href={brunette.href} />
          </div>
          <ServiceImage
            src={brunette.images.primary}
            alt={t(`${brunette.id}.primaryAlt`)}
            className="min-h-[18rem] lg:min-h-full"
            objectPosition="object-[50%_30%]"
            sizes="(max-width: 1024px) 100vw, 60vw"
          />
        </div>

        {/* 03 Colour Transformations — copper | copy | tools ‖ quote */}
        <div className="grid gap-1.5 sm:gap-2 lg:grid-cols-[1.25fr_0.95fr_1.1fr] lg:gap-2 lg:min-h-[24rem]">
          <ServiceImage
            src={colour.images.primary}
            alt={t(`${colour.id}.primaryAlt`)}
            className="min-h-[18rem] lg:min-h-full"
            objectPosition="object-[35%_25%]"
          />
          <div className="bg-cream">
            <ServiceCopy id={colour.id} href={colour.href} />
          </div>
          <div className="grid gap-1.5 sm:grid-cols-2 sm:gap-2 lg:gap-2">
            <ServiceImage
              src={colour.images.secondary!}
              alt={t(`${colour.id}.secondaryAlt`)}
              className="min-h-[12rem] sm:min-h-full"
            />
            <div className="flex items-center bg-[#e5d5c6] px-7 py-9 sm:px-8">
              <p className="script text-[1.4rem] leading-snug text-copper sm:text-[1.55rem]">
                {t(`${colour.id}.quote`)}
              </p>
            </div>
          </div>
        </div>

        {/* 04 Bridal Styling — copy | bride | flowers ‖ quote */}
        <div className="grid gap-1.5 sm:gap-2 lg:grid-cols-[1fr_1.15fr_1.1fr] lg:gap-2 lg:min-h-[24rem]">
          <div className="bg-cream-deep">
            <ServiceCopy id={bridal.id} href={bridal.href} />
          </div>
          <ServiceImage
            src={bridal.images.primary}
            alt={t(`${bridal.id}.primaryAlt`)}
            className="min-h-[18rem] lg:min-h-full"
            objectPosition="object-[50%_12%]"
          />
          <div className="grid gap-1.5 sm:grid-cols-2 sm:gap-2 lg:gap-2">
            <ServiceImage
              src={bridal.images.secondary!}
              alt={t(`${bridal.id}.secondaryAlt`)}
              className="min-h-[12rem] sm:min-h-full"
              objectPosition="object-center"
            />
            <div className="flex items-center bg-sand px-7 py-9 sm:px-8">
              <p className="font-serif text-[1.02rem] leading-relaxed text-ink sm:text-[1.12rem]">
                &ldquo;{t(`${bridal.id}.quote`)}&rdquo;
              </p>
            </div>
          </div>
        </div>

        {/* 05 Hair Health — dark full band */}
        <div className="grid gap-1.5 bg-charcoal sm:gap-2 lg:grid-cols-3 lg:gap-2 lg:min-h-[24rem]">
          <ServiceImage
            src={health.images.primary}
            alt={t(`${health.id}.primaryAlt`)}
            className="min-h-[16rem] lg:min-h-full"
            objectPosition="object-center"
          />
          <div className="bg-charcoal">
            <ServiceCopy id={health.id} href={health.href} tone="dark" />
          </div>
          <ServiceImage
            src={health.images.secondary!}
            alt={t(`${health.id}.secondaryAlt`)}
            className="min-h-[16rem] lg:min-h-full"
            objectPosition="object-center"
          />
        </div>

        {/* 06–08 — three equal columns, copy above image */}
        <div className="grid gap-1.5 sm:gap-2 lg:grid-cols-3 lg:gap-2">
          {[
            { block: extensions, pos: "object-[50%_30%]" },
            { block: cut, pos: "object-[50%_18%]" },
            { block: finishing, pos: "object-center" },
          ].map(({ block, pos }, i) => (
            <div key={block.id} className="grid grid-rows-[auto_1fr] gap-1.5 sm:gap-2 lg:gap-2">
              <div className={i === 1 ? "bg-[#ebe0d4]" : i === 0 ? "bg-cream-deep" : "bg-cream"}>
                <ServiceCopy id={block.id} href={block.href} compact />
              </div>
              <ServiceImage
                src={block.images.primary}
                alt={t(`${block.id}.primaryAlt`)}
                className="min-h-[16rem] aspect-[5/4] lg:aspect-auto lg:min-h-[17rem]"
                objectPosition={pos}
                sizes="(max-width: 1024px) 100vw, 33vw"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
