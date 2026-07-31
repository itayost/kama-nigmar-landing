"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import type posthogType from "posthog-js";

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com";

// Cookieless product analytics (grilling decision): memory-only persistence,
// so no identifiers are stored on the device and no consent banner is needed.
// Loaded lazily after idle to protect the landing-page JS budget, and click
// attribution uses ONE delegated listener reading data-ph-event attributes so
// recirculation cards stay server components.
export function AnalyticsProvider() {
  const pathname = usePathname();
  const posthogRef = useRef<typeof posthogType | null>(null);
  const isLoadingRef = useRef(false);

  useEffect(() => {
    if (!POSTHOG_KEY || isLoadingRef.current) return;
    isLoadingRef.current = true;

    const load = async () => {
      const { default: posthog } = await import("posthog-js");
      posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        persistence: "memory",
        autocapture: false,
        capture_pageview: false,
        capture_pageleave: true,
      });
      posthogRef.current = posthog;
      posthog.capture("$pageview");

      document.addEventListener("click", (event) => {
        const target = (event.target as HTMLElement | null)?.closest<HTMLElement>(
          "[data-ph-event]",
        );
        if (!target?.dataset.phEvent) return;
        posthog.capture(target.dataset.phEvent, {
          slug: target.dataset.phSlug,
          path: window.location.pathname,
        });
      });
    };

    if ("requestIdleCallback" in window) {
      requestIdleCallback(() => void load());
    } else {
      setTimeout(() => void load(), 2000);
    }
  }, []);

  const lastPathRef = useRef(pathname);
  useEffect(() => {
    if (pathname === lastPathRef.current) return;
    lastPathRef.current = pathname;
    posthogRef.current?.capture("$pageview");
  }, [pathname]);

  return null;
}
