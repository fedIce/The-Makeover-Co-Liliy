import { prisma } from "@/lib/prisma";

export async function getAdminSettings() {
  return prisma.adminSettings.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default" },
  });
}
