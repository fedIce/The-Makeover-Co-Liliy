import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getGoogleAuthUrl } from "@/lib/google-calendar";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/login?callbackUrl=/admin/settings", req.url));
  }
  try {
    const url = getGoogleAuthUrl("admin-connect");
    return NextResponse.redirect(url);
  } catch (e) {
    const reason =
      e instanceof Error && e.message.includes("not configured") ? "missing" : "error";
    return NextResponse.redirect(new URL(`/admin/settings?google=${reason}`, req.url));
  }
}
