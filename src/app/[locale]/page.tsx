import { setRequestLocale } from "next-intl/server";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Experience from "@/components/Experience";
import Services from "@/components/Services";
import MeetLilly from "@/components/MeetLilly";
import Instagram from "@/components/Instagram";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="flex h-svh flex-col pt-[var(--header-h)]">
          <Hero />
          <Features />
        </div>
        <Experience />
        <Services />
        <MeetLilly />
        <Instagram />
        <Testimonials />
      </main>
      <Footer />
    </>
  );
}
