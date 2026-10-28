"use client";

import { useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import SignOutButton from "@/components/auth/SignOutButton";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";

export default function Header() {
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/" as const, label: t("home"), match: "home" as const },
    { href: "/services" as const, label: t("services"), match: "services" as const },
    { href: "/lookbook" as const, label: t("lookbook"), match: "lookbook" as const },
    { href: "/#about" as const, label: t("aboutLilly"), match: "section" as const },
    { href: "/#reviews" as const, label: t("reviews"), match: "section" as const },
    { href: "/#pricing" as const, label: t("pricing"), match: "section" as const },
    { href: "/#contact" as const, label: t("contact"), match: "section" as const },
  ];

  const onLookbook = pathname.startsWith("/lookbook");
  const onServices = pathname.startsWith("/services");
  const onBook = pathname.startsWith("/book");

  const isActive = (link: (typeof links)[number]) => {
    if (link.match === "lookbook") return onLookbook;
    if (link.match === "services") return onServices;
    if (link.match === "home") return pathname === "/" && !onBook && !onServices;
    return false;
  };

  const switchLocale = (next: AppLocale) => {
    if (next === locale) return;
    router.replace(pathname, { locale: next });
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-ink/5 bg-cream">
      <div className="container-site flex h-[var(--header-h)] items-center justify-between gap-3 sm:gap-4 xl:gap-6">
        <Link href="/" className="shrink-0 text-center leading-none">
          <span className="block font-serif text-[0.82rem] font-semibold tracking-[0.18em] text-ink sm:text-[0.9rem]">
            {t("brand")}
          </span>
          <span className="mt-1 block text-[0.55rem] font-medium tracking-[0.28em] text-ink/70">
            {t("brandBy")}
          </span>
        </Link>

        <nav className="hidden items-center gap-7 xl:flex">
          {links.map((link) => {
            const active = isActive(link);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-[0.62rem] font-medium uppercase tracking-[0.2em] transition-colors ${
                  active
                    ? "border-b border-copper pb-1 text-copper"
                    : "text-ink/70 hover:text-copper"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {session?.user ? (
            <div className="hidden items-center gap-4 lg:flex">
              {session.user.role === "ADMIN" ? (
                <a
                  href="/admin"
                  className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-ink/70 hover:text-copper"
                >
                  {t("admin")}
                </a>
              ) : (
                <Link
                  href="/account"
                  className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-ink/70 hover:text-copper"
                >
                  {t("account")}
                </Link>
              )}
              <SignOutButton
                className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-ink/50 hover:text-copper"
                label={t("signOut")}
              />
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-ink/70 hover:text-copper lg:inline"
            >
              {t("signIn")}
            </Link>
          )}
          <Link
            href="/book"
            className="btn-primary inline-flex !px-3 !py-2 sm:!px-4 sm:!py-2.5"
            aria-label={t("bookAppointment")}
          >
            <span className="lg:hidden">{t("bookShort")}</span>
            <span className="hidden lg:inline">{t("bookAppointment")}</span>
            <CalendarIcon />
          </Link>
          <div className="hidden items-center gap-1.5 text-[0.62rem] font-semibold tracking-[0.14em] lg:flex">
            {routing.locales.map((code, i) => (
              <span key={code} className="contents">
                {i > 0 ? <span className="text-ink/25">|</span> : null}
                <button
                  type="button"
                  onClick={() => switchLocale(code)}
                  aria-pressed={locale === code}
                  className={locale === code ? "text-ink" : "text-ink/35 hover:text-ink"}
                >
                  {tCommon(`languages.${code}`)}
                </button>
              </span>
            ))}
          </div>
          <button
            type="button"
            aria-label={t("openMenu")}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="relative z-50 flex h-11 w-11 shrink-0 items-center justify-center text-ink xl:hidden"
          >
            <span className="sr-only">{t("openMenu")}</span>
            <span className="flex w-5 flex-col gap-1.5" aria-hidden>
              <span
                className={`block h-[2px] w-full rounded-full bg-ink transition-transform ${
                  open ? "translate-y-[8px] rotate-45" : ""
                }`}
              />
              <span
                className={`block h-[2px] w-full rounded-full bg-ink transition-opacity ${
                  open ? "opacity-0" : ""
                }`}
              />
              <span
                className={`block h-[2px] w-full rounded-full bg-ink transition-transform ${
                  open ? "-translate-y-[8px] -rotate-45" : ""
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-ink/5 bg-cream px-5 py-6 xl:hidden">
          <nav className="flex flex-col gap-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`text-xs font-medium uppercase tracking-[0.18em] ${
                  isActive(link) ? "text-copper" : "text-ink/80"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {session?.user ? (
              <>
                {session.user.role === "ADMIN" ? (
                  <a
                    href="/admin"
                    onClick={() => setOpen(false)}
                    className="text-xs uppercase tracking-wider text-ink/70"
                  >
                    {t("admin")}
                  </a>
                ) : (
                  <Link
                    href="/account"
                    onClick={() => setOpen(false)}
                    className="text-xs uppercase tracking-wider text-ink/70"
                  >
                    {t("account")}
                  </Link>
                )}
                <SignOutButton
                  className="text-left text-xs uppercase tracking-wider text-ink/50"
                  label={t("signOut")}
                />
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="text-xs uppercase tracking-wider text-ink/70"
              >
                {t("signIn")}
              </Link>
            )}
            <Link href="/book" onClick={() => setOpen(false)} className="btn-primary mt-2 w-full">
              {t("bookAppointment")}
            </Link>
            <div className="mt-2 flex items-center gap-2 text-xs font-semibold tracking-[0.14em]">
              {routing.locales.map((code, i) => (
                <span key={code} className="contents">
                  {i > 0 ? <span className="text-ink/25">|</span> : null}
                  <button
                    type="button"
                    onClick={() => {
                      switchLocale(code);
                      setOpen(false);
                    }}
                    aria-pressed={locale === code}
                    className={locale === code ? "text-ink" : "text-ink/35"}
                  >
                    {tCommon(`languages.${code}`)}
                  </button>
                </span>
              ))}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

function CalendarIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="5" width="18" height="16" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 9h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
