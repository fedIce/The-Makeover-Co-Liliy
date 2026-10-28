"use client";

import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useState } from "react";

const authDevMode = process.env.NEXT_PUBLIC_AUTH_DEV_MODE === "true";

export default function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const t = useTranslations("auth");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devUrl, setDevUrl] = useState<string | null>(null);

  async function fetchDevLink(forEmail: string) {
    if (!authDevMode) return null;
    try {
      const res = await fetch(`/api/dev/magic-link?email=${encodeURIComponent(forEmail)}`);
      if (!res.ok) return null;
      const data = (await res.json()) as { url?: string };
      return data.url ?? null;
    } catch {
      return null;
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setDevUrl(null);
    const result = await signIn("resend", { email, callbackUrl, redirect: false });
    const link = await fetchDevLink(email);
    setLoading(false);

    if (link) {
      setDevUrl(link);
      setSent(true);
      return;
    }

    if (result?.error) {
      setError(t("sendFailed"));
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="mt-8 space-y-4 border border-ink/10 bg-white px-4 py-5 text-sm text-muted">
        <p>{devUrl ? t("sentDev", { email }) : t("sentCheck", { email })}</p>
        {devUrl ? (
          <a href={devUrl} className="btn-primary inline-flex">
            {t("openLink")}
          </a>
        ) : null}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4">
      <label className="block text-xs uppercase tracking-wider text-muted">
        {t("email")}
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full border border-ink/15 bg-white px-3 py-3 text-sm"
        />
      </label>
      {authDevMode ? (
        <p className="text-xs text-muted">{t("devHint")}</p>
      ) : null}
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <button type="submit" className="btn-primary w-full" disabled={loading}>
        {loading ? t("sending") : t("submit")}
      </button>
    </form>
  );
}
