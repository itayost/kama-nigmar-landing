"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import type { Navigation } from "@/lib/dal/navigation";
import { isActivePath } from "./NavLinks";

interface SiteMenuProps {
  readonly navigation: Navigation;
  readonly spotifyUrl: string;
  readonly applePodcastUrl: string;
}

interface MenuItem {
  readonly href: string;
  readonly label: string;
  readonly color: string;
  readonly mark: "fill" | "outline";
  readonly count?: number;
  readonly latest?: string | null;
}

function MenuIcon({ open }: { readonly open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
      {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M10 17h10" />}
    </svg>
  );
}

const subscribeNever = () => () => {};

const roundButton =
  "menu-button grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/15 bg-white/[0.06] text-white transition-colors hover:bg-white/[0.12]";

// The phone and tablet navigation: a button that opens a full-page menu with
// every subject, its count and newest headline, and the latest episode.
export function SiteMenu({ navigation, spotifyUrl, applePodcastUrl }: SiteMenuProps) {
  const pathname = usePathname();
  // The page the menu was opened on: navigating anywhere closes it.
  const [openedOn, setOpenedOn] = useState<string | null>(null);
  const open = openedOn === pathname;
  // The portal needs document.body, so the menu renders only after hydration.
  const mounted = useSyncExternalStore(subscribeNever, () => true, () => false);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    closeButton.current?.focus({ preventScroll: true });
    return () => {
      root.style.overflow = previous;
    };
  }, [open]);

  function close() {
    setOpenedOn(null);
    trigger.current?.focus({ preventScroll: true });
  }

  // Keeps Tab inside the open menu and lets Escape close it.
  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") return close();
    if (event.key !== "Tab" || !panel.current) return;
    const focusable = panel.current.querySelectorAll<HTMLElement>("a[href], button");
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  const items: MenuItem[] = [
    { href: "/", label: "בית", color: "var(--color-accent)", mark: "fill" },
    ...navigation.subjects.map((subject) => ({
      href: `/topics/${subject.slug}`,
      label: subject.name,
      color: subject.color,
      mark: "fill" as const,
      count: subject.count,
      latest: subject.latest,
    })),
    { href: "/roundups", label: "סיכומים", color: "#ffffff", mark: "fill", count: navigation.roundups.count, latest: navigation.roundups.latest },
    { href: "/articles", label: "כל הכתבות", color: "var(--color-text-muted)", mark: "outline", count: navigation.total },
  ];

  return (
    <>
      <button
        ref={trigger}
        type="button"
        aria-label="פתיחת התפריט"
        aria-expanded={open}
        aria-controls="site-menu"
        onClick={() => setOpenedOn(pathname)}
        className={`${roundButton} lg:hidden`}
      >
        <MenuIcon open={false} />
      </button>
      {mounted
        ? createPortal(
            <div
              ref={panel}
              id="site-menu"
              role="dialog"
              aria-modal="true"
              aria-label="תפריט"
              dir="rtl"
              data-open={open ? "" : undefined}
              inert={!open}
              onKeyDown={onKeyDown}
              className="site-menu fixed inset-0 z-50 flex flex-col overflow-y-auto bg-[linear-gradient(160deg,#0b1a31_0%,var(--color-bg-end)_100%)] lg:hidden"
            >
              <div className="flex h-15 shrink-0 items-center gap-3 border-b border-surface-border px-6">
                <button ref={closeButton} type="button" aria-label="סגירת התפריט" onClick={close} className={roundButton}>
                  <MenuIcon open />
                </button>
                <Link href="/" className="text-xl font-black tracking-tight">
                  כמה נגמר<span className="text-accent">?</span>
                </Link>
              </div>
              <nav aria-label="ניווט ראשי" className="flex flex-col gap-0.5 px-3 pt-3">
                {items.map((item, index) => (
                  <MenuLink key={item.href} item={item} index={index} active={isActivePath(pathname, item.href)} />
                ))}
              </nav>
              <div className="site-menu-item mx-6 mt-4 grid grid-cols-[3.25rem_minmax(0,1fr)] items-center gap-x-3 gap-y-0.5 rounded-2xl border border-surface-border bg-white/5 p-4" style={{ "--i": items.length } as CSSProperties}>
                <Image src="/cover.png" alt="" width={52} height={52} className="row-span-2 h-13 w-13 rounded-xl" />
                <span className="text-xs font-bold text-accent">הפרק האחרון</span>
                <span className="text-sm font-bold">כמה נגמר? התקציר היומי שלכם</span>
                <span className="col-span-2 mt-3 flex gap-2">
                  <a href={spotifyUrl} target="_blank" rel="noopener noreferrer" className="flex-1 rounded-full bg-spotify py-2 text-center text-sm font-bold text-bg-start">
                    Spotify
                  </a>
                  <a href={applePodcastUrl} target="_blank" rel="noopener noreferrer" className="flex-1 rounded-full bg-apple py-2 text-center text-sm font-bold text-white">
                    Apple Podcasts
                  </a>
                </span>
              </div>
              <div className="mt-auto flex gap-4 px-6 pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-sm text-text-muted">
                <Link href="/terms" className="hover:text-white">תנאי שימוש</Link>
                <Link href="/privacy" className="hover:text-white">מדיניות פרטיות</Link>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

function MenuLink({ item, index, active }: { readonly item: MenuItem; readonly index: number; readonly active: boolean }) {
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      style={{ "--subject": item.color, "--i": index } as CSSProperties}
      className="site-menu-item grid grid-cols-[0.75rem_minmax(0,1fr)_auto] items-center gap-x-3 rounded-2xl px-3 py-2.5 transition-colors hover:bg-white/[0.04] aria-[current=page]:bg-[color-mix(in_srgb,var(--subject)_14%,transparent)]"
    >
      <span
        aria-hidden="true"
        className={`h-3 w-3 rounded-[3px] ${item.mark === "fill" ? "bg-[var(--subject)]" : "border-2 border-[var(--subject)]"}`}
      />
      <span className="text-2xl font-black leading-tight tracking-tight">{item.label}</span>
      <span className="text-xs tabular-nums text-text-muted">{item.count ?? ""}</span>
      {item.latest ? <span className="col-start-2 col-end-4 truncate text-sm text-text-muted">{item.latest}</span> : null}
    </Link>
  );
}
