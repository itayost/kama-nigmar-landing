import Link from "next/link";
import { Suspense } from "react";
import { NavLinks } from "./NavLinks";

// Static fallback while the pathname-aware links resolve: same links,
// no active underline. Keeps the header prerenderable under cacheComponents.
function NavLinksFallback() {
  return (
    <>
      <Link href="/" className="text-sm font-medium text-text-muted transition-colors hover:text-white">
        בית
      </Link>
      <Link href="/articles" className="text-sm font-medium text-text-muted transition-colors hover:text-white">
        כתבות
      </Link>
    </>
  );
}

interface SiteHeaderProps {
  readonly spotifyUrl: string;
}

export function SiteHeader({ spotifyUrl }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-surface-border bg-bg-start/85 backdrop-blur-md">
      <div className="mx-auto flex h-15 w-full max-w-5xl items-center justify-between px-6">
        <Link
          href="/"
          className="whitespace-nowrap text-xl font-black tracking-tight transition-colors hover:text-accent"
        >
          כמה נגמר<span className="text-accent">?</span>
        </Link>
        <nav aria-label="ניווט ראשי" className="flex items-center gap-7">
          <Suspense fallback={<NavLinksFallback />}>
            <NavLinks />
          </Suspense>
          <a
            href={spotifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden whitespace-nowrap rounded-full bg-accent px-3.5 py-2 text-sm font-bold text-bg-start transition-all hover:-translate-y-px hover:shadow-[0_0_24px_rgba(46,204,64,0.45)] motion-reduce:transition-none min-[360px]:inline-block sm:px-4.5"
          >
            האזינו עכשיו
          </a>
        </nav>
      </div>
    </header>
  );
}
