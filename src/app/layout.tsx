import type { Metadata } from "next";
import { Great_Vibes, Montserrat, Noto_Sans, Playfair_Display } from "next/font/google";
import SessionProvider from "@/components/providers/SessionProvider";
import "./globals.css";

const serif = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin", "cyrillic", "latin-ext"],
  weight: ["400", "500", "600", "700"],
});

const sans = Montserrat({
  variable: "--font-sans",
  subsets: ["latin", "cyrillic", "latin-ext", "cyrillic-ext"],
  weight: ["300", "400", "500", "600", "700"],
});

// Montserrat has no Greek subset in next/font — Noto covers EL glyphs as fallback
const sansGreek = Noto_Sans({
  variable: "--font-sans-greek",
  subsets: ["greek", "greek-ext", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const script = Great_Vibes({
  variable: "--font-script",
  subsets: ["latin", "latin-ext"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "The Makeover Co. by Lilly | Luxury Hair Specialist",
  description:
    "Luxury hair specialist in Limassol, Cyprus. Expert in blondes, balayage, and bespoke colour transformations.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${serif.variable} ${sans.variable} ${sansGreek.variable} ${script.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream font-sans text-ink">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
