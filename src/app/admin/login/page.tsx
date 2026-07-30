import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = {
  title: "כניסת מנהל",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-6">
      <div className="w-full max-w-sm rounded-2xl border border-surface-border bg-surface p-8">
        <h1 className="mb-6 text-center text-2xl font-bold">ניהול כתבות</h1>
        <LoginForm />
      </div>
    </main>
  );
}
