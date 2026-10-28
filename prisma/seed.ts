import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const services = [
  {
    slug: "unlimited-blonding",
    title: "Unlimited Blonding",
    description: "Seamless blondes with depth & dimension.",
    durationMin: 180,
    bufferMin: 30,
    priceCents: 12000,
    depositCents: 3600,
    imageUrl: "/images/services/unlimited-blonding.jpg",
    sortOrder: 1,
  },
  {
    slug: "balayage-highlights",
    title: "Balayage & Highlights",
    description: "Hand-painted for a natural blend.",
    durationMin: 150,
    bufferMin: 30,
    priceCents: 11000,
    depositCents: 3300,
    imageUrl: "/images/services/balayage-highlights.jpg",
    sortOrder: 2,
  },
  {
    slug: "colour-correction",
    title: "Colour Correction",
    description: "Fix, balance & transform with precision.",
    durationMin: 240,
    bufferMin: 30,
    priceCents: 15000,
    depositCents: 4500,
    imageUrl: "/images/services/colour-correction.jpg",
    sortOrder: 3,
  },
  {
    slug: "gloss-toner",
    title: "Gloss & Toner",
    description: "Add shine, tone & refresh your colour.",
    durationMin: 60,
    bufferMin: 15,
    priceCents: 6000,
    depositCents: 1800,
    imageUrl: "/images/services/gloss-toner.jpg",
    sortOrder: 4,
  },
  {
    slug: "hair-botox",
    title: "Hair Botox",
    description: "Smooth, repair & restore your hair.",
    durationMin: 90,
    bufferMin: 15,
    priceCents: 8000,
    depositCents: 2400,
    imageUrl: "/images/services/hair-botox.jpg",
    sortOrder: 5,
  },
  {
    slug: "hair-extensions",
    title: "Hair Extensions",
    description: "Add length, volume & confidence.",
    durationMin: 180,
    bufferMin: 30,
    priceCents: 30000,
    depositCents: 9000,
    imageUrl: "/images/services/hair-extensions.jpg",
    sortOrder: 6,
  },
];

/** Tue–Sat 09:00–18:00 (weekday 2–6) */
const rules = [2, 3, 4, 5, 6].map((weekday) => ({
  weekday,
  startTime: "09:00",
  endTime: "18:00",
}));

async function main() {
  await prisma.adminSettings.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default" },
  });

  for (const service of services) {
    await prisma.service.upsert({
      where: { slug: service.slug },
      update: service,
      create: service,
    });
  }

  await prisma.availabilityRule.deleteMany();
  await prisma.availabilityRule.createMany({ data: rules });

  const adminEmail = (process.env.ADMIN_EMAILS ?? "lilly@themakeoverco.com")
    .split(",")[0]
    ?.trim()
    .toLowerCase();

  if (adminEmail) {
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: { role: "ADMIN", name: "Lilly" },
      create: { email: adminEmail, name: "Lilly", role: "ADMIN" },
    });
  }

  console.log("Seed complete:", { services: services.length, rules: rules.length, adminEmail });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
