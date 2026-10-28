import { google } from "googleapis";
import { decrypt, encrypt } from "@/lib/crypto";
import { getAdminSettings } from "@/lib/settings";
import { prisma } from "@/lib/prisma";

const SCOPES = [
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/calendar.freebusy",
  "https://www.googleapis.com/auth/userinfo.email",
];

export function getOAuthClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error("Google OAuth env vars are not configured");
  }
  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

export function getGoogleAuthUrl(state?: string) {
  const client = getOAuthClient();
  return client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES,
    state,
  });
}

export async function saveGoogleTokens(refreshToken: string, email?: string) {
  const enc = encrypt(refreshToken);
  await prisma.adminSettings.upsert({
    where: { id: "default" },
    update: {
      googleRefreshTokenEnc: enc,
      googleConnectedEmail: email ?? null,
    },
    create: {
      id: "default",
      googleRefreshTokenEnc: enc,
      googleConnectedEmail: email ?? null,
    },
  });
}

export async function getAuthenticatedCalendar() {
  const settings = await getAdminSettings();
  if (!settings.googleRefreshTokenEnc) return null;

  const client = getOAuthClient();
  client.setCredentials({ refresh_token: decrypt(settings.googleRefreshTokenEnc) });
  const calendar = google.calendar({ version: "v3", auth: client });
  return { calendar, calendarId: settings.googleCalendarId ?? "primary", settings };
}

export async function fetchBusyIntervals(timeMin: Date, timeMax: Date) {
  const auth = await getAuthenticatedCalendar();
  if (!auth) return [] as { start: Date; end: Date }[];

  const res = await auth.calendar.freebusy.query({
    requestBody: {
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      items: [{ id: auth.calendarId }],
    },
  });

  const busy = res.data.calendars?.[auth.calendarId]?.busy ?? [];
  return busy
    .filter((b) => b.start && b.end)
    .map((b) => ({ start: new Date(b.start!), end: new Date(b.end!) }));
}

export async function createCalendarEvent(input: {
  summary: string;
  description: string;
  startsAt: Date;
  endsAt: Date;
}) {
  const auth = await getAuthenticatedCalendar();
  if (!auth) return null;

  const event = await auth.calendar.events.insert({
    calendarId: auth.calendarId,
    requestBody: {
      summary: input.summary,
      description: input.description,
      start: { dateTime: input.startsAt.toISOString(), timeZone: "Asia/Nicosia" },
      end: { dateTime: input.endsAt.toISOString(), timeZone: "Asia/Nicosia" },
    },
  });

  return event.data.id ?? null;
}

export async function deleteCalendarEvent(eventId: string) {
  const auth = await getAuthenticatedCalendar();
  if (!auth) return;
  try {
    await auth.calendar.events.delete({
      calendarId: auth.calendarId,
      eventId,
    });
  } catch {
    // Event may already be gone
  }
}

export async function disconnectGoogle() {
  await prisma.adminSettings.update({
    where: { id: "default" },
    data: {
      googleRefreshTokenEnc: null,
      googleConnectedEmail: null,
    },
  });
}
