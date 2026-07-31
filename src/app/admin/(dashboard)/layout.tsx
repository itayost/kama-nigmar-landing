import type { Metadata } from "next";
import Link from "next/link";
import { logout } from "@/lib/actions/auth";

export const metadata: Metadata = {
  title: "ניהול כתבות",
  robots: { index: false, follow: false },
};

// Visual chrome only — auth is enforced per page through the admin DAL,
// because layouts do not re-run on client navigation.
export default function AdminDashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-dvh">
      <header className="border-b border-surface-border">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-6 py-4">
          <h1 className="text-lg font-bold">ניהול כתבות</h1>
          <nav className="flex items-center gap-4 text-sm">
            <Link
              href="/admin"
              className="text-text-muted transition-colors hover:text-white"
            >
              כתבות
            </Link>
            <Link
              href="/admin/tags"
              className="text-text-muted transition-colors hover:text-white"
            >
              תגיות
            </Link>
            <Link
              href="/"
              className="text-text-muted transition-colors hover:text-white"
            >
              צפייה באתר
            </Link>
            <form action={logout}>
              <button
                type="submit"
                className="text-text-muted transition-colors hover:text-white"
              >
                יציאה
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-4xl px-6 py-8">{children}</main>
    </div>
  );
}
