import AdminAvailabilityClient from "@/components/admin/AdminAvailabilityClient";
import { prisma } from "@/lib/prisma";
import { hasDatabaseUrl } from "@/lib/db-ready";

export default async function AdminAvailabilityPage() {
  const [rules, exceptions] = hasDatabaseUrl()
    ? await Promise.all([
        prisma.availabilityRule.findMany({ orderBy: [{ weekday: "asc" }, { startTime: "asc" }] }),
        prisma.availabilityException.findMany({ orderBy: { date: "asc" }, take: 60 }),
      ])
    : [[], []];

  return (
    <div>
      <h1 className="font-serif text-3xl">Availability</h1>
      <p className="mt-2 text-sm text-cream/50">Weekly hours and closed dates (Nicosia time).</p>
      <AdminAvailabilityClient
        initialRules={rules}
        initialExceptions={exceptions.map((e) => ({
          ...e,
          date: e.date.toISOString().slice(0, 10),
        }))}
      />
    </div>
  );
}
