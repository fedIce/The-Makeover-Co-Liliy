import { getTranslations } from "next-intl/server";

const featureKeys = [
  { key: "blondeSpecialist", icon: DiamondIcon },
  { key: "colourExpert", icon: DropperIcon },
  { key: "premiumProducts", icon: BottleIcon },
  { key: "personalisedApproach", icon: HeartIcon },
  { key: "luxuryExperience", icon: StarIcon },
  { key: "impeccableResults", icon: CrownIcon },
] as const;

export default async function Features() {
  const t = await getTranslations("home.features");

  return (
    <section className="shrink-0 border-y border-ink/[0.06] bg-cream">
      <div className="container-site grid grid-cols-3 gap-x-3 gap-y-5 py-5 sm:grid-cols-3 lg:grid-cols-6 lg:gap-y-0 lg:py-6">
        {featureKeys.map(({ key, icon: Icon }) => (
          <div key={key} className="flex flex-col items-center gap-2 text-center">
            <Icon />
            <span className="max-w-[7.5rem] text-[0.55rem] font-semibold uppercase tracking-[0.16em] text-ink/75">
              {t(key)}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function IconWrap({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex h-8 w-8 items-center justify-center text-copper" aria-hidden>
      {children}
    </span>
  );
}

function DiamondIcon() {
  return (
    <IconWrap>
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <path d="M12 3l7 7-7 11L5 10l7-7z" stroke="currentColor" strokeWidth="1.15" />
        <path d="M5 10h14" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      </svg>
    </IconWrap>
  );
}

function DropperIcon() {
  return (
    <IconWrap>
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <path d="M12 2v3M9.5 5h5" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" />
        <path d="M8.5 8h7l-1.1 2.8a4 4 0 01-1.3 1.8v6.2a1.3 1.3 0 01-2.6 0v-6.2a4 4 0 01-1.3-1.8L8.5 8z" stroke="currentColor" strokeWidth="1.15" />
      </svg>
    </IconWrap>
  );
}

function BottleIcon() {
  return (
    <IconWrap>
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <path d="M10 3h4v2.5h-4V3zM9.2 5.5h5.6v2c1.6.5 2.7 1.9 2.7 3.6V19a1 1 0 01-1 1H7.5a1 1 0 01-1-1v-7.9c0-1.7 1.1-3.1 2.7-3.6v-2z" stroke="currentColor" strokeWidth="1.15" />
      </svg>
    </IconWrap>
  );
}

function HeartIcon() {
  return (
    <IconWrap>
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <path d="M12 19.5s-6.5-4-6.5-8.4A3.5 3.5 0 0112 8a3.5 3.5 0 016.5 3.1c0 4.4-6.5 8.4-6.5 8.4z" stroke="currentColor" strokeWidth="1.15" />
      </svg>
    </IconWrap>
  );
}

function StarIcon() {
  return (
    <IconWrap>
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <path d="M12 3.8l2 4.8 5.2.5-4 3.5 1.2 5.1L12 15.4 7.6 17.7l1.2-5.1-4-3.5 5.2-.5L12 3.8z" stroke="currentColor" strokeWidth="1.15" />
      </svg>
    </IconWrap>
  );
}

function CrownIcon() {
  return (
    <IconWrap>
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <path d="M4.5 15.5l1.8-8 3.7 3.5L12 5.5l1.9 5.5 3.8-3.5 1.8 8H4.5z" stroke="currentColor" strokeWidth="1.15" strokeLinejoin="round" />
        <path d="M5.5 17.5h13" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" />
      </svg>
    </IconWrap>
  );
}
