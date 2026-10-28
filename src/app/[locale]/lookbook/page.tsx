import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Header from "@/components/Header";
import LookbookHero from "@/components/lookbook/LookbookHero";
import StyleGrid from "@/components/lookbook/StyleGrid";
import Transformations from "@/components/lookbook/Transformations";
import LookbookCta from "@/components/lookbook/LookbookCta";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "lookbook.meta" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function LookbookPage({
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
        <LookbookHero />
        <StyleGrid />
        <Transformations />
        <LookbookCta />
      </main>
    </>
  );
}
