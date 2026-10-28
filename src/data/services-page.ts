export type ServiceBlock = {
  id: string;
  number: string;
  title: string;
  script: string;
  description: string;
  href: string;
  images: {
    primary: string;
    secondary?: string;
  };
  quote?: string;
  tone?: "light" | "dark";
};

export const servicesPageBlocks: ServiceBlock[] = [
  {
    id: "blonde-atelier",
    number: "01",
    title: "Blonde Atelier",
    script: "Bright. Dimensional. Effortless.",
    description:
      "From soft lived-in blondes to high-impact platinum — crafted with precision, care, and the health of your hair always first.",
    href: "/book?service=unlimited-blonding",
    images: {
      primary: "/images/services-page/blonde-atelier.jpg",
      secondary: "/images/services-page/color-tools.jpg",
    },
  },
  {
    id: "brunette-studio",
    number: "02",
    title: "Brunette Studio",
    script: "Rich. Glossy. Quiet luxury.",
    description:
      "Depth, shine, and soft dimension for brunettes who want that expensive, effortless finish — from chocolate to espresso.",
    href: "/book?service=balayage-highlights",
    images: {
      primary: "/images/services-page/brunette-studio.jpg",
    },
  },
  {
    id: "colour-transformations",
    number: "03",
    title: "Colour Transformations",
    script: "Expert colour. Multi-tonal perfection.",
    description:
      "Bold changes, corrections, and custom colour stories — planned carefully so the result feels intentional, not accidental.",
    href: "/book?service=colour-correction",
    images: {
      primary: "/images/services-page/color-transformation.jpg",
      secondary: "/images/services-page/color-tools-secondary.jpg",
    },
    quote: "Expert colour. Results. Blends. Perfection.",
  },
  {
    id: "bridal-styling",
    number: "04",
    title: "Bridal Styling",
    script: "Timeless. Soft. Unforgettable.",
    description:
      "Trial-to-day-of styling for brides and bridal parties — romantic updos, soft waves, and finishes that photograph beautifully.",
    href: "/book",
    images: {
      primary: "/images/services-page/bridal-updo.jpg",
      secondary: "/images/services-page/bridal-florals.jpg",
    },
    quote: "Because every detail should feel as special as the moment itself.",
  },
  {
    id: "hair-health",
    number: "05",
    title: "Hair Health",
    script: "Restore. Strengthen. Glow.",
    description:
      "Treatments that rebuild softness and strength — so colour lasts longer, styles hold better, and hair feels as good as it looks.",
    href: "/book?service=hair-botox",
    images: {
      primary: "/images/services-page/hair-wash.jpg",
      secondary: "/images/services-page/hair-ritual.jpg",
    },
    tone: "dark",
  },
  {
    id: "extensions",
    number: "06",
    title: "Extensions",
    script: "Length. Volume. Confidence.",
    description:
      "Seamless extensions matched to your colour and lifestyle — for fuller density, added length, or a soft temporary change.",
    href: "/book?service=hair-extensions",
    images: {
      primary: "/images/services-page/extensions.jpg",
    },
  },
  {
    id: "cut-styling",
    number: "07",
    title: "Cut & Styling",
    script: "Shape. Movement. Ease.",
    description:
      "Precision cuts and finishing that work with your texture — from soft layers to sharp bobs that grow out beautifully.",
    href: "/book",
    images: {
      primary: "/images/services-page/cut-styling.jpg",
    },
  },
  {
    id: "finishing-touches",
    number: "08",
    title: "Finishing Touches",
    script: "Polish. Shine. Longevity.",
    description:
      "Gloss, toner, and styling refinements that lock in colour, add mirror shine, and keep your look salon-fresh between visits.",
    href: "/book?service=gloss-toner",
    images: {
      primary: "/images/services-page/finishing-tools.jpg",
    },
  },
];
