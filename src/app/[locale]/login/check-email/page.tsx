import { getTranslations, setRequestLocale } from "next-intl/server";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default async function CheckEmailPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("auth.checkEmail");

  return (
    <>
      <Header />
      <main className="flex-1 pt-[var(--header-h)]">
        <div className="mx-auto max-w-md px-5 py-16 text-center">
          <h1 className="font-serif text-3xl">{t("title")}</h1>
          <p className="mt-4 text-sm text-muted">{t("body")}</p>
        </div>
      </main>
      <Footer />
    </>
  );
}
