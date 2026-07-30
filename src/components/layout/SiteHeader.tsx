import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-surface-border bg-bg-start/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-3">
        <Link href="/" className="text-lg font-extrabold transition-colors hover:text-accent">
          כמה נגמר?
        </Link>
        <nav aria-label="ניווט ראשי">
          <Link
            href="/articles"
            className="text-sm text-text-muted transition-colors hover:text-white"
          >
            כתבות
          </Link>
        </nav>
      </div>
    </header>
  );
}
