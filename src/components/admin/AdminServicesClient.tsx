"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { formatEur } from "@/lib/money";

type ServiceRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  durationMin: number;
  bufferMin: number;
  priceCents: number;
  depositCents: number;
  active: boolean;
  imageUrl: string | null;
  sortOrder: number;
  priceLabel: string;
  depositLabel: string;
};

type NewServiceForm = {
  title: string;
  description: string;
  durationMin: string;
  bufferMin: string;
  priceEur: string;
  depositEur: string;
  active: boolean;
};

const emptyForm = (): NewServiceForm => ({
  title: "",
  description: "",
  durationMin: "90",
  bufferMin: "15",
  priceEur: "",
  depositEur: "",
  active: true,
});

export default function AdminServicesClient({ initial }: { initial: ServiceRow[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(initial);
  const [saving, setSaving] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<NewServiceForm>(emptyForm);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeModal();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function closeModal() {
    if (creating) return;
    setOpen(false);
    setCreateError(null);
    setForm(emptyForm());
  }

  async function saveRow(row: ServiceRow, patch: Partial<ServiceRow>) {
    setSaving(row.id);
    const next = { ...row, ...patch };
    const res = await fetch("/api/admin/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    });
    if (res.ok) {
      setRows((prev) => prev.map((r) => (r.id === row.id ? next : r)));
      router.refresh();
    }
    setSaving(null);
  }

  async function createService(e: React.FormEvent) {
    e.preventDefault();
    setCreateError(null);

    const durationMin = Math.round(Number(form.durationMin));
    const bufferMin = Math.round(Number(form.bufferMin));
    const priceCents = Math.round(parseFloat(form.priceEur) * 100);
    const depositCents = Math.round(parseFloat(form.depositEur) * 100);

    if (form.title.trim().length < 2) {
      setCreateError("Enter a service title.");
      return;
    }
    if (form.description.trim().length < 2) {
      setCreateError("Enter a short description.");
      return;
    }
    if (!Number.isFinite(durationMin) || durationMin < 15) {
      setCreateError("Time estimate must be at least 15 minutes.");
      return;
    }
    if (!Number.isFinite(bufferMin) || bufferMin < 0) {
      setCreateError("Buffer must be 0 or more.");
      return;
    }
    if (!Number.isFinite(priceCents) || priceCents <= 0) {
      setCreateError("Enter a valid price.");
      return;
    }
    if (!Number.isFinite(depositCents) || depositCents < 0) {
      setCreateError("Enter a valid deposit.");
      return;
    }
    if (depositCents > priceCents) {
      setCreateError("Deposit can’t be higher than the price.");
      return;
    }

    setCreating(true);
    const res = await fetch("/api/admin/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title.trim(),
        description: form.description.trim(),
        durationMin,
        bufferMin,
        priceCents,
        depositCents,
        active: form.active,
        imageUrl: null,
      }),
    });
    setCreating(false);

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setCreateError(body?.error ?? "Could not create service.");
      return;
    }

    const created = (await res.json()) as Omit<ServiceRow, "priceLabel" | "depositLabel">;
    setRows((prev) => [
      ...prev,
      {
        ...created,
        priceLabel: formatEur(created.priceCents),
        depositLabel: formatEur(created.depositCents),
      },
    ]);
    setForm(emptyForm());
    setOpen(false);
    router.refresh();
  }

  const inputClass =
    "mt-1 w-full border border-cream/20 bg-charcoal px-3 py-2 text-sm text-cream";

  return (
    <div className="mt-8">
      <div className="mb-6">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="bg-copper px-4 py-2 text-[0.65rem] font-semibold uppercase tracking-wider text-white"
        >
          Add service
        </button>
      </div>

      <ul className="space-y-4">
        {rows.map((row) => (
          <li key={row.id} className="border border-cream/10 bg-charcoal-soft p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-serif text-lg">{row.title}</p>
                <p className="text-xs text-cream/40">{row.slug}</p>
                <p className="mt-2 text-sm text-cream/50">
                  Blocks {row.durationMin + row.bufferMin} min on the calendar (service + buffer)
                </p>
              </div>
              <button
                type="button"
                disabled={saving === row.id}
                onClick={() => saveRow(row, { active: !row.active })}
                className={`text-[0.65rem] uppercase tracking-wider ${row.active ? "text-copper" : "text-cream/30"}`}
              >
                {row.active ? "Active" : "Inactive"}
              </button>
            </div>
            <div className="mt-4 flex flex-wrap gap-3 text-sm">
              <label className="text-cream/50">
                Time estimate (min)
                <input
                  type="number"
                  min={15}
                  step={15}
                  defaultValue={row.durationMin}
                  className="ml-2 w-20 border border-cream/20 bg-charcoal px-2 py-1 text-cream"
                  onBlur={(e) => {
                    const durationMin = Math.round(Number(e.target.value));
                    if (
                      !Number.isNaN(durationMin) &&
                      durationMin >= 15 &&
                      durationMin !== row.durationMin
                    ) {
                      saveRow(row, { durationMin });
                    }
                  }}
                />
              </label>
              <label className="text-cream/50">
                Buffer (min)
                <input
                  type="number"
                  min={0}
                  step={5}
                  defaultValue={row.bufferMin}
                  className="ml-2 w-20 border border-cream/20 bg-charcoal px-2 py-1 text-cream"
                  onBlur={(e) => {
                    const bufferMin = Math.round(Number(e.target.value));
                    if (!Number.isNaN(bufferMin) && bufferMin >= 0 && bufferMin !== row.bufferMin) {
                      saveRow(row, { bufferMin });
                    }
                  }}
                />
              </label>
              <label className="text-cream/50">
                Price €
                <input
                  type="number"
                  step="0.01"
                  defaultValue={(row.priceCents / 100).toFixed(2)}
                  className="ml-2 w-24 border border-cream/20 bg-charcoal px-2 py-1 text-cream"
                  onBlur={(e) => {
                    const priceCents = Math.round(parseFloat(e.target.value) * 100);
                    if (!Number.isNaN(priceCents) && priceCents !== row.priceCents) {
                      saveRow(row, { priceCents });
                    }
                  }}
                />
              </label>
              <label className="text-cream/50">
                Deposit €
                <input
                  type="number"
                  step="0.01"
                  defaultValue={(row.depositCents / 100).toFixed(2)}
                  className="ml-2 w-24 border border-cream/20 bg-charcoal px-2 py-1 text-cream"
                  onBlur={(e) => {
                    const depositCents = Math.round(parseFloat(e.target.value) * 100);
                    if (!Number.isNaN(depositCents) && depositCents !== row.depositCents) {
                      saveRow(row, { depositCents });
                    }
                  }}
                />
              </label>
            </div>
          </li>
        ))}
      </ul>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/70 p-4"
          onClick={closeModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-service-title"
            className="w-full max-w-lg border border-cream/10 bg-charcoal-soft p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <h2 id="add-service-title" className="font-serif text-2xl text-cream">
                Add service
              </h2>
              <button
                type="button"
                onClick={closeModal}
                disabled={creating}
                className="text-cream/40 transition hover:text-cream"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <form onSubmit={createService} className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="block text-xs uppercase tracking-wider text-cream/50 sm:col-span-2">
                Title
                <input
                  required
                  autoFocus
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className={inputClass}
                  placeholder="e.g. Gloss & Toner"
                />
              </label>

              <label className="block text-xs uppercase tracking-wider text-cream/50 sm:col-span-2">
                Description
                <textarea
                  required
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className={inputClass}
                  placeholder="Short line shown to clients"
                />
              </label>

              <label className="block text-xs uppercase tracking-wider text-cream/50">
                Time estimate (min)
                <input
                  type="number"
                  min={15}
                  step={15}
                  required
                  value={form.durationMin}
                  onChange={(e) => setForm({ ...form, durationMin: e.target.value })}
                  className={inputClass}
                />
              </label>

              <label className="block text-xs uppercase tracking-wider text-cream/50">
                Buffer (min)
                <input
                  type="number"
                  min={0}
                  step={5}
                  required
                  value={form.bufferMin}
                  onChange={(e) => setForm({ ...form, bufferMin: e.target.value })}
                  className={inputClass}
                />
              </label>

              <label className="block text-xs uppercase tracking-wider text-cream/50">
                Price €
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  required
                  value={form.priceEur}
                  onChange={(e) => setForm({ ...form, priceEur: e.target.value })}
                  className={inputClass}
                  placeholder="120.00"
                />
              </label>

              <label className="block text-xs uppercase tracking-wider text-cream/50">
                Deposit €
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  required
                  value={form.depositEur}
                  onChange={(e) => setForm({ ...form, depositEur: e.target.value })}
                  className={inputClass}
                  placeholder="36.00"
                />
              </label>

              <label className="flex items-center gap-2 text-sm text-cream/70 sm:col-span-2">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                  className="accent-copper"
                />
                Active (visible in booking)
              </label>

              {createError ? (
                <p className="text-sm text-copper sm:col-span-2">{createError}</p>
              ) : null}

              <div className="flex gap-3 sm:col-span-2">
                <button
                  type="submit"
                  disabled={creating}
                  className="bg-copper px-4 py-2 text-[0.65rem] font-semibold uppercase tracking-wider text-white disabled:opacity-60"
                >
                  {creating ? "Adding…" : "Add service"}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={creating}
                  className="border border-cream/20 px-4 py-2 text-[0.65rem] font-semibold uppercase tracking-wider text-cream/60"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
