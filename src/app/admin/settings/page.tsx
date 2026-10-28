import Link from "next/link";
import { hasDatabaseUrl } from "@/lib/db-ready";
import { getAdminSettings } from "@/lib/settings";
import AdminSettingsClient from "@/components/admin/AdminSettingsClient";

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ google?: string }>;
}) {
  const { google } = await searchParams;
  const googleConfigured = Boolean(
    process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.GOOGLE_REDIRECT_URI,
  );
  const settings = hasDatabaseUrl()
    ? await getAdminSettings()
    : {
        googleRefreshTokenEnc: null as string | null,
        googleConnectedEmail: null as string | null,
        googleCalendarId: "primary",
        cancelWindowHours: 48,
        holdTtlMinutes: 12,
        reminderH48: true,
        reminderH24: true,
        reminderMorning: true,
      };

  return (
    <div>
      <h1 className="font-serif text-3xl">Settings</h1>
      {google === "connected" && (
        <p className="mt-4 text-sm text-copper">Google Calendar connected.</p>
      )}
      {(google === "error" || google === "missing") && (
        <p className="mt-4 text-sm text-copper">
          {google === "missing" || !googleConfigured
            ? "Google OAuth is not configured. Add GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REDIRECT_URI to .env, then restart the server."
            : "Google connection failed. Try again."}
        </p>
      )}
      {google === "norefresh" && (
        <p className="mt-4 text-sm text-copper">
          No refresh token returned. Revoke app access in Google and reconnect.
        </p>
      )}

      <section className="mt-8 border border-cream/10 bg-charcoal-soft p-5">
        <h2 className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-copper">
          Google Calendar
        </h2>
        <p className="mt-2 text-sm text-cream/60">
          {settings.googleRefreshTokenEnc
            ? `Connected as ${settings.googleConnectedEmail ?? "Lilly"}`
            : googleConfigured
              ? "Not connected"
              : "OAuth credentials missing in .env"}
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          {googleConfigured ? (
            <Link
              href="/api/google/oauth/start"
              className="bg-copper px-4 py-2 text-[0.65rem] font-semibold uppercase tracking-wider text-white"
            >
              {settings.googleRefreshTokenEnc ? "Reconnect" : "Connect Google"}
            </Link>
          ) : (
            <span className="border border-cream/20 px-4 py-2 text-[0.65rem] font-semibold uppercase tracking-wider text-cream/35">
              Connect Google
            </span>
          )}
        </div>
      </section>

      <AdminSettingsClient
        initial={{
          cancelWindowHours: settings.cancelWindowHours,
          holdTtlMinutes: settings.holdTtlMinutes,
          reminderH48: settings.reminderH48,
          reminderH24: settings.reminderH24,
          reminderMorning: settings.reminderMorning,
          googleCalendarId: settings.googleCalendarId ?? "primary",
        }}
      />
    </div>
  );
}
