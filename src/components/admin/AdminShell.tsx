import Link from "next/link";
import { signOut } from "@/lib/auth";

const links = [
  { href: "/admin", label: "Agenda" },
  { href: "/admin/services", label: "Services" },
  { href: "/admin/availability", label: "Availability" },
  { href: "/admin/settings", label: "Settings" },
];

export default function AdminShell({
  children,
  email,
}: {
  children: React.ReactNode;
  email?: string | null;
}) {
  return (
    <div className="min-h-screen bg-charcoal text-cream">
      <header className="border-b border-cream/10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4">
          <div>
            <p className="font-serif text-sm tracking-[0.14em]">THE MAKEOVER CO.</p>
            <p className="text-[0.55rem] tracking-[0.2em] text-cream/50">ADMIN</p>
          </div>
          <nav className="flex flex-wrap gap-4 text-[0.62rem] font-semibold uppercase tracking-[0.16em]">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="text-cream/70 hover:text-copper">
                {l.label}
              </Link>
            ))}
            <Link href="/en" className="text-cream/40 hover:text-cream">
              Site
            </Link>
          </nav>
          <div className="flex items-center gap-3 text-xs text-cream/50">
            <span>{email}</span>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/en" });
              }}
            >
              <button type="submit" className="text-copper hover:underline">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-10">{children}</main>
    </div>
  );
}
