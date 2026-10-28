import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDaysWithAvailability, getSlotOptions } from "@/lib/slots";

const querySchema = z.object({
  serviceId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  days: z.coerce.number().min(1).max(62).optional(),
});

export async function GET(req: NextRequest) {
  const parsed = querySchema.safeParse(Object.fromEntries(req.nextUrl.searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }

  const { serviceId, date, from, days } = parsed.data;

  if (date) {
    const options = await getSlotOptions(serviceId, date);
    return NextResponse.json({
      date,
      options,
      /** @deprecated prefer options — open times only */
      slots: options.filter((o) => o.available).map((o) => o.time),
    });
  }

  if (from) {
    const dayMeta = await getDaysWithAvailability(serviceId, from, days ?? 28);
    return NextResponse.json({
      from,
      /** Dates that still have at least one bookable start for this service. */
      days: dayMeta.filter((d) => d.slots > 0).map((d) => d.date),
      dayMeta,
    });
  }

  return NextResponse.json({ error: "Provide date or from" }, { status: 400 });
}
