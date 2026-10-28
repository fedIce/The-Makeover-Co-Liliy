import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function assertAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session;
}

export async function GET() {
  if (!(await assertAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [rules, exceptions] = await Promise.all([
    prisma.availabilityRule.findMany({ orderBy: [{ weekday: "asc" }, { startTime: "asc" }] }),
    prisma.availabilityException.findMany({ orderBy: { date: "asc" }, take: 100 }),
  ]);
  return NextResponse.json({ rules, exceptions });
}

const rulesSchema = z.object({
  rules: z.array(
    z.object({
      weekday: z.number().int().min(0).max(6),
      startTime: z.string(),
      endTime: z.string(),
    }),
  ),
});

export async function PUT(req: NextRequest) {
  if (!(await assertAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = rulesSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  await prisma.$transaction([
    prisma.availabilityRule.deleteMany(),
    prisma.availabilityRule.createMany({ data: parsed.data.rules }),
  ]);

  return NextResponse.json({ ok: true });
}

const exceptionSchema = z.object({
  date: z.string(),
  closed: z.boolean().default(true),
  startTime: z.string().optional().nullable(),
  endTime: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
});

export async function POST(req: NextRequest) {
  if (!(await assertAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = exceptionSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const exception = await prisma.availabilityException.create({
    data: {
      date: new Date(parsed.data.date),
      closed: parsed.data.closed,
      startTime: parsed.data.startTime,
      endTime: parsed.data.endTime,
      note: parsed.data.note,
    },
  });
  return NextResponse.json(exception);
}

export async function DELETE(req: NextRequest) {
  if (!(await assertAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await prisma.availabilityException.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
