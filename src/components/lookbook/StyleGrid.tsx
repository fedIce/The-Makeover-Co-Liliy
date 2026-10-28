import LookCard from "./LookCard";

const rowOne = [
  {
    styleId: "old-money-brunette",
    image: "/images/lookbook/look-old-money-brunette.jpg",
    tone: "dark" as const,
  },
  {
    styleId: "beach-blondes",
    image: "/images/lookbook/look-beach-blondes.jpg",
    tone: "light" as const,
  },
];

const rowTwo = [
  {
    styleId: "goth-chic",
    image: "/images/lookbook/look-goth-chic.jpg",
    tone: "dark" as const,
  },
  {
    styleId: "bombshell-vibes",
    image: "/images/lookbook/look-bombshell-vibes.jpg",
    tone: "dark" as const,
  },
  {
    styleId: "soft-girl",
    image: "/images/lookbook/look-soft-girl.jpg",
    tone: "light" as const,
  },
];

const rowThree = [
  {
    styleId: "copper-goddess",
    image: "/images/lookbook/look-copper-goddess.jpg",
  },
  {
    styleId: "french-bob",
    image: "/images/lookbook/look-french-bob.jpg",
  },
  {
    styleId: "mermaid-hair",
    image: "/images/lookbook/look-mermaid-hair.jpg",
  },
  {
    styleId: "curly-queen",
    image: "/images/lookbook/look-curly-queen.jpg",
  },
  {
    styleId: "party-glam",
    image: "/images/lookbook/look-party-glam.jpg",
  },
];

export default function StyleGrid() {
  return (
    <section id="styles" className="bg-cream">
      {/* Row 1 — 50/50 split panels, edge-to-edge */}
      <div className="grid lg:grid-cols-2">
        {rowOne.map((look) => (
          <LookCard
            key={look.styleId}
            {...look}
            variant="panel"
            className="min-h-[22rem] sm:min-h-[26rem]"
          />
        ))}
      </div>

      {/* Row 2 — 3 equal panels */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3">
        {rowTwo.map((look) => (
          <LookCard
            key={look.styleId}
            {...look}
            variant="panel"
            className="min-h-[20rem] sm:min-h-[24rem]"
          />
        ))}
      </div>

      {/* Row 3 — 5 overlay tiles, full bleed */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {rowThree.map((look) => (
          <LookCard
            key={look.styleId}
            {...look}
            tone="dark"
            variant="overlay"
            className="min-h-[18rem] border-r border-b border-cream/20 last:border-r-0 sm:min-h-[20rem]"
          />
        ))}
      </div>
    </section>
  );
}
