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
  const services = await prisma.service.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json(services);
}

function slugify(title: string) {
  return title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

const upsertSchema = z.object({
  id: z.string().optional(),
  slug: z.string().min(2).optional(),
  title: z.string().min(2),
  description: z.string().min(2),
  durationMin: z.number().int().min(15).max(12 * 60),
  bufferMin: z.number().int().min(0).max(180),
  priceCents: z.number().int().positive(),
  depositCents: z.number().int().nonnegative(),
  active: z.boolean().default(true),
  imageUrl: z
    .union([z.string().url(), z.literal(""), z.null()])
    .optional()
    .transform((v) => (v ? v : null)),
  sortOrder: z.number().int().optional(),
});

export async function POST(req: NextRequest) {
  if (!(await assertAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = upsertSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid", details: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;

  if (data.id) {
    const service = await prisma.service.update({
      where: { id: data.id },
      data: {
        title: data.title,
        description: data.description,
        durationMin: data.durationMin,
        bufferMin: data.bufferMin,
        priceCents: data.priceCents,
        depositCents: data.depositCents,
        active: data.active,
        imageUrl: data.imageUrl ?? null,
      },
    });
    return NextResponse.json(service);
  }

  const baseSlug = data.slug?.trim() || slugify(data.title) || "service";
  let slug = baseSlug;
  let n = 2;
  while (await prisma.service.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${n++}`;
  }

  const maxSort = await prisma.service.aggregate({ _max: { sortOrder: true } });
  const service = await prisma.service.create({
    data: {
      slug,
      title: data.title,
      description: data.description,
      durationMin: data.durationMin,
      bufferMin: data.bufferMin,
      priceCents: data.priceCents,
      depositCents: data.depositCents,
      active: data.active,
      imageUrl: data.imageUrl ?? null,
      sortOrder: data.sortOrder ?? (maxSort._max.sortOrder ?? 0) + 1,
    },
  });

  return NextResponse.json(service);
}
