"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/** Display order: Mon → Sun (JS weekday: 0=Sun … 6=Sat) */
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0] as const;
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

type Rule = { id?: string; weekday: number; startTime: string; endTime: string };
type DayRow = {
  weekday: number;
  startTime: string;
  endTime: string;
  enabled: boolean;
};
type Exception = {
  id: string;
  date: string;
  closed: boolean;
  startTime: string | null;
  endTime: string | null;
  note: string | null;
};

function buildDays(initialRules: Rule[]): DayRow[] {
  return WEEK_ORDER.map((weekday) => {
    const existing = initialRules.find((r) => r.weekday === weekday);
    return {
      weekday,
      startTime: existing?.startTime ?? "09:00",
      endTime: existing?.endTime ?? "18:00",
      enabled: Boolean(existing),
    };
  });
}

export default function AdminAvailabilityClient({
  initialRules,
  initialExceptions,
}: {
  initialRules: Rule[];
  initialExceptions: Exception[];
}) {
  const router = useRouter();
  const [days, setDays] = useState<DayRow[]>(() => buildDays(initialRules));
  const [exceptions, setExceptions] = useState(initialExceptions);
  const [date, setDate] = useState("");
  const [saving, setSaving] = useState(false);

  function updateDay(weekday: number, patch: Partial<DayRow>) {
    setDays((prev) =>
      prev.map((d) => (d.weekday === weekday ? { ...d, ...patch } : d)),
    );
  }

  async function saveRules() {
    setSaving(true);
    const rules = days
      .filter((d) => d.enabled)
      .map(({ weekday, startTime, endTime }) => ({ weekday, startTime, endTime }));
    await fetch("/api/admin/availability", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rules }),
    });
    setSaving(false);
    router.refresh();
  }

  async function addException() {
    if (!date) return;
    const res = await fetch("/api/admin/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, closed: true }),
    });
    const created = await res.json();
    setExceptions((prev) => [
      ...prev,
      { ...created, date: created.date?.slice?.(0, 10) ?? date },
    ]);
    setDate("");
    router.refresh();
  }

  async function removeException(id: string) {
    await fetch(`/api/admin/availability?id=${id}`, { method: "DELETE" });
    setExceptions((prev) => prev.filter((e) => e.id !== id));
    router.refresh();
  }

  return (
    <div className="mt-8 space-y-10">
      <section>
        <h2 className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-copper">
          Weekly hours
        </h2>
        <ul className="mt-4 space-y-2">
          {days.map((day) => (
            <li
              key={day.weekday}
              className="flex flex-wrap items-center gap-3 text-sm"
            >
              <span className="w-10 text-cream/60">{DAY_NAMES[day.weekday]}</span>
              <button
                type="button"
                role="switch"
                aria-checked={day.enabled}
                aria-label={`${DAY_NAMES[day.weekday]} ${day.enabled ? "open" : "closed"}`}
                onClick={() => updateDay(day.weekday, { enabled: !day.enabled })}
                className={`min-w-[4.5rem] border px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-wider transition-colors ${
                  day.enabled
                    ? "border-copper/60 bg-copper/20 text-copper"
                    : "border-cream/20 text-cream/40"
                }`}
              >
                {day.enabled ? "On" : "Off"}
              </button>
              <input
                value={day.startTime}
                disabled={!day.enabled}
                onChange={(e) => updateDay(day.weekday, { startTime: e.target.value })}
                className="w-24 border border-cream/20 bg-charcoal px-2 py-1 disabled:opacity-40"
              />
              <span className="text-cream/30">–</span>
              <input
                value={day.endTime}
                disabled={!day.enabled}
                onChange={(e) => updateDay(day.weekday, { endTime: e.target.value })}
                className="w-24 border border-cream/20 bg-charcoal px-2 py-1 disabled:opacity-40"
              />
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={saveRules}
          disabled={saving}
          className="mt-4 bg-copper px-4 py-2 text-[0.65rem] font-semibold uppercase tracking-wider text-white"
        >
          {saving ? "Saving…" : "Save hours"}
        </button>
      </section>

      <section>
        <h2 className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-copper">
          Closed dates
        </h2>
        <div className="mt-4 flex flex-wrap gap-2">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border border-cream/20 bg-charcoal px-2 py-1 text-sm"
          />
          <button
            type="button"
            onClick={addException}
            className="border border-cream/20 px-3 py-1 text-[0.65rem] uppercase tracking-wider"
          >
            Add closed day
          </button>
        </div>
        <ul className="mt-4 space-y-2 text-sm">
          {exceptions.map((e) => (
            <li key={e.id} className="flex items-center justify-between border border-cream/10 px-3 py-2">
              <span>
                {e.date} {e.closed ? "(closed)" : ""}
              </span>
              <button type="button" className="text-copper" onClick={() => removeException(e.id)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
