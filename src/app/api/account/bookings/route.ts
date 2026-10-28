import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const bookings = await prisma.booking.findMany({
    where: {
      OR: [{ clientId: session.user.id }, { guestEmail: session.user.email ?? "" }],
      status: { in: ["CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"] },
    },
    include: { service: true },
    orderBy: { startsAt: "desc" },
  });

  return NextResponse.json(bookings);
}
