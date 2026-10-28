import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LoginForm from "@/components/auth/LoginForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth.meta" });
  return { title: t("title") };
}

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("auth");
  const { callbackUrl, error } = await searchParams;

  return (
    <>
      <Header />
      <main className="flex-1 pt-[var(--header-h)]">
        <div className="mx-auto max-w-md px-5 py-16 lg:px-8">
          <p className="section-label">{t("label")}</p>
          <h1 className="mt-3 font-serif text-3xl font-medium">{t("title")}</h1>
          <p className="mt-2 text-sm text-muted">{t("subtitle")}</p>
          {error && (
            <p className="mt-4 text-sm text-copper">{t("error")}</p>
          )}
          <LoginForm callbackUrl={callbackUrl ?? `/${locale}/account`} />
        </div>
      </main>
      <Footer />
    </>
  );
}
