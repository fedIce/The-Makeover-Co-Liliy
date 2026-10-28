import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { createHold } from "@/lib/bookings";

const emptyToUndef = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? undefined : v;

const bodySchema = z.object({
  serviceId: z.string().min(1),
  dateKey: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  timeHHmm: z
    .string()
    .transform((t) => {
      const m = t.trim().match(/^(\d{1,2}):(\d{2})$/);
      if (!m) return t;
      return `${m[1]!.padStart(2, "0")}:${m[2]}`;
    })
    .pipe(z.string().regex(/^\d{2}:\d{2}$/)),
  guestName: z.string().trim().min(2, "Enter your full name"),
  guestEmail: z.string().trim().email("Enter a valid email"),
  guestPhone: z.preprocess(emptyToUndef, z.string().trim().max(40).optional()),
  notes: z.preprocess(emptyToUndef, z.string().trim().max(2000).optional()),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const first =
        Object.values(fieldErrors).flat()[0] ??
        "Check your name, email, and selected time";
      return NextResponse.json(
        { error: first, details: fieldErrors },
        { status: 400 },
      );
    }

    const session = await auth();
    const booking = await createHold({
      ...parsed.data,
      clientId: session?.user?.id,
    });

    return NextResponse.json({
      bookingId: booking.id,
      depositCents: booking.service.depositCents,
      priceCents: booking.service.priceCents,
      holdExpiresAt: booking.holdExpiresAt,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    if (message === "SLOT_UNAVAILABLE") {
      return NextResponse.json({ error: "That time is no longer available" }, { status: 409 });
    }
    console.error(e);
    return NextResponse.json({ error: "Could not create hold" }, { status: 500 });
  }
}
