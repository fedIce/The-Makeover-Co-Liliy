"use client";

import { useState } from "react";

type Settings = {
  cancelWindowHours: number;
  holdTtlMinutes: number;
  reminderH48: boolean;
  reminderH24: boolean;
  reminderMorning: boolean;
  googleCalendarId: string;
};

export default function AdminSettingsClient({ initial }: { initial: Settings }) {
  const [form, setForm] = useState(initial);
  const [saved, setSaved] = useState(false);

  async function save() {
    await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function disconnect() {
    if (!confirm("Disconnect Google Calendar?")) return;
    await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ disconnectGoogle: true }),
    });
    window.location.reload();
  }

  return (
    <section className="mt-8 space-y-4 border border-cream/10 bg-charcoal-soft p-5">
      <h2 className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-copper">
        Policies & reminders
      </h2>
      <label className="block text-sm text-cream/60">
        Cancel window (hours)
        <input
          type="number"
          value={form.cancelWindowHours}
          onChange={(e) => setForm({ ...form, cancelWindowHours: Number(e.target.value) })}
          className="mt-1 block w-32 border border-cream/20 bg-charcoal px-2 py-1 text-cream"
        />
      </label>
      <label className="block text-sm text-cream/60">
        Hold TTL (minutes)
        <input
          type="number"
          value={form.holdTtlMinutes}
          onChange={(e) => setForm({ ...form, holdTtlMinutes: Number(e.target.value) })}
          className="mt-1 block w-32 border border-cream/20 bg-charcoal px-2 py-1 text-cream"
        />
      </label>
      <label className="block text-sm text-cream/60">
        Calendar ID
        <input
          value={form.googleCalendarId}
          onChange={(e) => setForm({ ...form, googleCalendarId: e.target.value })}
          className="mt-1 block w-full max-w-md border border-cream/20 bg-charcoal px-2 py-1 text-cream"
        />
      </label>
      {(
        [
          ["reminderH48", "48h reminder"],
          ["reminderH24", "24h reminder"],
          ["reminderMorning", "Morning-of reminder"],
        ] as const
      ).map(([key, label]) => (
        <label key={key} className="flex items-center gap-2 text-sm text-cream/70">
          <input
            type="checkbox"
            checked={form[key]}
            onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
          />
          {label}
        </label>
      ))}
      <div className="flex flex-wrap gap-3 pt-2">
        <button
          type="button"
          onClick={save}
          className="bg-copper px-4 py-2 text-[0.65rem] font-semibold uppercase tracking-wider text-white"
        >
          Save settings
        </button>
        <button
          type="button"
          onClick={disconnect}
          className="border border-cream/20 px-4 py-2 text-[0.65rem] font-semibold uppercase tracking-wider"
        >
          Disconnect Google
        </button>
        {saved && <span className="text-sm text-copper">Saved</span>}
      </div>
    </section>
  );
}
