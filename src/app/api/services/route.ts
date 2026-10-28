import { NextResponse } from "next/server";
import { hasDatabaseUrl } from "@/lib/db-ready";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!hasDatabaseUrl()) {
    return NextResponse.json([]);
  }

  try {
    const services = await prisma.service.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        durationMin: true,
        priceCents: true,
        depositCents: true,
      },
    });
    return NextResponse.json(services);
  } catch (err) {
    console.error("[api/services]", err);
    return NextResponse.json({ error: "Could not load services" }, { status: 503 });
  }
}
