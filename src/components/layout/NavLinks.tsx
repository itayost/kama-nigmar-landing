"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "בית" },
  { href: "/articles", label: "כתבות" },
] as const;

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function NavLinks() {
  const pathname = usePathname();

  return (
    <>
      {LINKS.map(({ href, label }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={
              active
                ? "relative text-sm font-medium text-white after:absolute after:inset-x-0 after:-bottom-[19px] after:h-0.5 after:rounded-full after:bg-accent"
                : "text-sm font-medium text-text-muted transition-colors hover:text-white"
            }
          >
            {label}
          </Link>
        );
      })}
    </>
  );
}
