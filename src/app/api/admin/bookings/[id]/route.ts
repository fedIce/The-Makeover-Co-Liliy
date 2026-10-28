import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cancelBooking } from "@/lib/bookings";

async function assertAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session;
}

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!(await assertAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { service: true, client: true },
  });
  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(booking);
}

const patchSchema = z.object({
  status: z.enum(["COMPLETED", "NO_SHOW", "CANCELLED"]).optional(),
  notes: z.string().optional(),
});

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!(await assertAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  if (parsed.data.status === "CANCELLED") {
    const booking = await cancelBooking(id, { force: true });
    return NextResponse.json(booking);
  }

  const booking = await prisma.booking.update({
    where: { id },
    data: {
      status: parsed.data.status,
      notes: parsed.data.notes,
    },
    include: { service: true },
  });
  return NextResponse.json(booking);
}
