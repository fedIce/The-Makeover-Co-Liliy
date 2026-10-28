"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CancelBookingButton({ bookingId }: { bookingId: string }) {
  const t = useTranslations("account");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onCancel() {
    if (!confirm(t("cancelConfirm"))) return;
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/account/bookings/${bookingId}/cancel`, { method: "POST" });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? t("cancelError"));
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <button
        type="button"
        onClick={onCancel}
        disabled={loading}
        className="text-xs font-semibold uppercase tracking-wider text-copper"
      >
        {loading ? t("cancelling") : t("cancel")}
      </button>
      {error && <p className="mt-1 text-xs text-copper">{error}</p>}
    </div>
  );
}
