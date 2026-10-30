"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { subjectStyle } from "@/components/articles/subject";

export interface NavLink {
  readonly href: string;
  readonly label: string;
  readonly color?: string;
}

export function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

const idle = "flex h-full items-center gap-2 whitespace-nowrap text-sm font-medium text-text-muted transition-colors hover:text-white";

export function NavLinks({ links }: { readonly links: readonly NavLink[] }) {
  const pathname = usePathname();
  return <NavLinkList links={links} isActive={(href) => isActivePath(pathname, href)} />;
}

// Same links without the active mark: the static fallback while the
// pathname-aware version resolves, which keeps the header prerenderable.
export function NavLinksFallback({ links }: { readonly links: readonly NavLink[] }) {
  return <NavLinkList links={links} isActive={() => false} />;
}

function NavLinkList({ links, isActive }: { readonly links: readonly NavLink[]; isActive(href: string): boolean }) {
  return (
    <>
      {links.map(({ href, label, color }) => {
        const active = isActive(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            style={subjectStyle(color)}
            className={
              active
                ? `${idle} relative text-white after:absolute after:inset-x-0 after:bottom-px after:h-0.5 after:rounded-full after:bg-[var(--subject)]`
                : idle
            }
          >
            {color ? <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[var(--subject)]" /> : null}
            {label}
          </Link>
        );
      })}
    </>
  );
}
