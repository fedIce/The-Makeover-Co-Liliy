import { prisma } from "@/lib/prisma";
import { hasDatabaseUrl } from "@/lib/db-ready";
import { formatEur } from "@/lib/money";
import AdminServicesClient from "@/components/admin/AdminServicesClient";

export default async function AdminServicesPage() {
  const services = hasDatabaseUrl()
    ? await prisma.service.findMany({ orderBy: { sortOrder: "asc" } })
    : [];
  return (
    <div>
      <h1 className="font-serif text-3xl">Services</h1>
      <p className="mt-2 text-sm text-cream/50">
        Time estimate controls how long each booking blocks the calendar (plus buffer).
      </p>
      <AdminServicesClient
        initial={services.map((s) => ({
          ...s,
          priceLabel: formatEur(s.priceCents),
          depositLabel: formatEur(s.depositCents),
        }))}
      />
    </div>
  );
}
