import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Resend from "next-auth/providers/resend";
import { prisma } from "@/lib/prisma";
import { sendMagicLinkEmail } from "@/lib/email";
import { isAuthDevMode, storeDevMagicLink } from "@/lib/auth-dev";

function adminEmails(): Set<string> {
  return new Set(
    (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: process.env.EMAIL_FROM ?? "The Makeover Co. <onboarding@resend.dev>",
      async sendVerificationRequest({ identifier, url }) {
        storeDevMagicLink(identifier, url);
        try {
          await sendMagicLinkEmail({ to: identifier, url });
        } catch (err) {
          if (isAuthDevMode()) {
            console.warn(
              "[auth-dev] Resend failed; use the on-screen or console magic link.",
              err instanceof Error ? err.message : err,
            );
            return;
          }
          throw err;
        }
      },
    }),
  ],
  session: { strategy: "database" },
  pages: {
    signIn: "/login",
    verifyRequest: "/login/check-email",
    error: "/login",
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
        session.user.role = dbUser?.role ?? "CLIENT";
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      if (!user.email) return;
      const isAdmin = adminEmails().has(user.email.toLowerCase());
      if (isAdmin) {
        await prisma.user.update({
          where: { id: user.id },
          data: { role: "ADMIN" },
        });
      }
    },
  },
  trustHost: true,
});
