import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { getAdminSettings } from "@/lib/settings";
import { prisma } from "@/lib/prisma";
import { disconnectGoogle } from "@/lib/google-calendar";

async function assertAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session;
}

export async function GET() {
  if (!(await assertAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const settings = await getAdminSettings();
  return NextResponse.json({
    googleConnected: Boolean(settings.googleRefreshTokenEnc),
    googleConnectedEmail: settings.googleConnectedEmail,
    googleCalendarId: settings.googleCalendarId,
    cancelWindowHours: settings.cancelWindowHours,
    holdTtlMinutes: settings.holdTtlMinutes,
    reminderH48: settings.reminderH48,
    reminderH24: settings.reminderH24,
    reminderMorning: settings.reminderMorning,
    timezone: settings.timezone,
  });
}

const patchSchema = z.object({
  cancelWindowHours: z.number().int().min(0).max(168).optional(),
  holdTtlMinutes: z.number().int().min(5).max(60).optional(),
  reminderH48: z.boolean().optional(),
  reminderH24: z.boolean().optional(),
  reminderMorning: z.boolean().optional(),
  googleCalendarId: z.string().optional(),
  disconnectGoogle: z.boolean().optional(),
});

export async function PATCH(req: NextRequest) {
  if (!(await assertAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  if (parsed.data.disconnectGoogle) {
    await disconnectGoogle();
  }

  const { disconnectGoogle: _, ...rest } = parsed.data;
  await prisma.adminSettings.update({
    where: { id: "default" },
    data: rest,
  });

  return NextResponse.json({ ok: true });
}
