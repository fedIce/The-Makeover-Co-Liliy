import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cancelBooking } from "@/lib/bookings";

export async function POST(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const owns =
    booking.clientId === session.user.id ||
    booking.guestEmail.toLowerCase() === (session.user.email ?? "").toLowerCase();
  if (!owns) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const updated = await cancelBooking(id);
    return NextResponse.json(updated);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error";
    if (message === "CANCEL_WINDOW") {
      return NextResponse.json(
        { error: "Cancellations must be at least 48 hours before the appointment" },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "Could not cancel" }, { status: 400 });
  }
}
