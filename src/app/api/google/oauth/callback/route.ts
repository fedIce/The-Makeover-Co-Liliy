import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { getOAuthClient, saveGoogleTokens } from "@/lib/google-calendar";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const code = req.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.redirect(new URL("/admin/settings?google=error", req.url));
  }

  try {
    const client = getOAuthClient();
    const { tokens } = await client.getToken(code);
    if (!tokens.refresh_token) {
      return NextResponse.redirect(new URL("/admin/settings?google=norefresh", req.url));
    }
    client.setCredentials(tokens);
    const oauth2 = google.oauth2({ version: "v2", auth: client });
    const me = await oauth2.userinfo.get();
    await saveGoogleTokens(tokens.refresh_token, me.data.email ?? undefined);
    return NextResponse.redirect(new URL("/admin/settings?google=connected", req.url));
  } catch (e) {
    console.error(e);
    return NextResponse.redirect(new URL("/admin/settings?google=error", req.url));
  }
}
