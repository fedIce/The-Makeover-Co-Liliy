import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import BookWizard from "@/components/booking/BookWizard";
import { hasDatabaseUrl } from "@/lib/db-ready";
import { prisma } from "@/lib/prisma";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "book.meta" });
  return { title: t("title") };
}

export const dynamic = "force-dynamic";

async function loadServices() {
  if (!hasDatabaseUrl()) return [];
  try {
    return await prisma.service.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        durationMin: true,
        priceCents: true,
        depositCents: true,
      },
    });
  } catch (err) {
    console.error("[book] services", err);
    return [];
  }
}

export default async function BookPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("book");
  const services = await loadServices();

  return (
    <Suspense
      fallback={
        <div className="flex h-dvh w-screen items-center justify-center bg-cream text-sm text-muted">
          {t("loading")}
        </div>
      }
    >
      <BookWizard initialServices={services} />
    </Suspense>
  );
}
