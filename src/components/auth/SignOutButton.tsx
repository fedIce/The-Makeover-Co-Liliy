"use client";

import { signOut } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";

export default function SignOutButton({
  className,
  label,
  callbackUrl,
}: {
  className?: string;
  label?: string;
  callbackUrl?: string;
}) {
  const t = useTranslations("auth");
  const locale = useLocale();
  const resolvedLabel = label ?? t("signOut");
  const resolvedCallback = callbackUrl ?? `/${locale}`;

  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: resolvedCallback })}
      className={className}
    >
      {resolvedLabel}
    </button>
  );
}
