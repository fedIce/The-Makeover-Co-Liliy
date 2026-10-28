/** Marketing catalogue — keep in sync with prisma/seed.ts */
export const marketingServices = [
  {
    slug: "unlimited-blonding",
    title: "Unlimited Blonding",
    description: "Seamless blondes with depth & dimension.",
    priceCents: 12000,
    image: "/images/services/unlimited-blonding.jpg",
  },
  {
    slug: "balayage-highlights",
    title: "Balayage & Highlights",
    description: "Hand-painted for a natural blend.",
    priceCents: 11000,
    image: "/images/services/balayage-highlights.jpg",
  },
  {
    slug: "colour-correction",
    title: "Colour Correction",
    description: "Fix, balance & transform with precision.",
    priceCents: 15000,
    image: "/images/services/colour-correction.jpg",
  },
  {
    slug: "gloss-toner",
    title: "Gloss & Toner",
    description: "Add shine, tone & refresh your colour.",
    priceCents: 6000,
    image: "/images/services/gloss-toner.jpg",
  },
  {
    slug: "hair-botox",
    title: "Hair Botox",
    description: "Smooth, repair & restore your hair.",
    priceCents: 8000,
    image: "/images/services/hair-botox.jpg",
  },
  {
    slug: "hair-extensions",
    title: "Hair Extensions",
    description: "Add length, volume & confidence.",
    priceCents: 30000,
    image: "/images/services/hair-extensions.jpg",
  },
] as const;
