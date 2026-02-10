import Link from "next/link";
import { signOut } from "@/app/actions/auth";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-sky-50">
      <header className="border-b border-emerald-100/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <Link className="text-lg font-semibold text-emerald-600" href="/dashboard">
            Split Spend
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium text-zinc-600">
            <Link className="hover:text-zinc-900" href="/dashboard">
              Dashboard
            </Link>
            <form action={signOut}>
              <button className="rounded-full border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-700 hover:border-zinc-300">
                Sign out
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
