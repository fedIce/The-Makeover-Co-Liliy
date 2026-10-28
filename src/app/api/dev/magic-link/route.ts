import { NextRequest, NextResponse } from "next/server";
import { getDevMagicLink, isAuthDevMode } from "@/lib/auth-dev";

export async function GET(req: NextRequest) {
  if (!isAuthDevMode()) {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

  const email = req.nextUrl.searchParams.get("email") ?? undefined;
  const entry = getDevMagicLink(email);
  if (!entry) {
    return NextResponse.json({ error: "No recent magic link" }, { status: 404 });
  }

  return NextResponse.json({ email: entry.email, url: entry.url });
}
