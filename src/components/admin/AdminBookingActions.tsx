"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminBookingActions({
  bookingId,
  status,
}: {
  bookingId: string;
  status: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function setStatus(next: "COMPLETED" | "NO_SHOW" | "CANCELLED") {
    setLoading(true);
    await fetch(`/api/admin/bookings/${bookingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setLoading(false);
    router.refresh();
  }

  if (status !== "CONFIRMED") {
    return <p className="mt-8 text-sm text-cream/40">No actions for {status} bookings.</p>;
  }

  return (
    <div className="mt-10 flex flex-wrap gap-3">
      <button
        type="button"
        disabled={loading}
        onClick={() => setStatus("COMPLETED")}
        className="bg-copper px-4 py-2 text-[0.65rem] font-semibold uppercase tracking-wider text-white"
      >
        Mark completed
      </button>
      <button
        type="button"
        disabled={loading}
        onClick={() => setStatus("NO_SHOW")}
        className="border border-cream/20 px-4 py-2 text-[0.65rem] font-semibold uppercase tracking-wider"
      >
        No-show
      </button>
      <button
        type="button"
        disabled={loading}
        onClick={() => setStatus("CANCELLED")}
        className="border border-copper/50 px-4 py-2 text-[0.65rem] font-semibold uppercase tracking-wider text-copper"
      >
        Cancel
      </button>
    </div>
  );
}
