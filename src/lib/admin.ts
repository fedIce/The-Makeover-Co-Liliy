import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) redirect("/en/login?callbackUrl=/admin");
  if (session.user.role !== "ADMIN") redirect("/en");
  return session;
}

export async function requireUser() {
  const session = await auth();
  if (!session?.user) redirect("/en/login?callbackUrl=/en/account");
  return session;
}
