"use client";

import { useEffect, useRef } from "react";

interface ViewTrackerProps {
  readonly slug: string;
}

export function ViewTracker({ slug }: ViewTrackerProps) {
  const hasFired = useRef(false);

  useEffect(() => {
    if (hasFired.current) return;
    hasFired.current = true;

    const payload = JSON.stringify({ slug });
    if (typeof navigator.sendBeacon === "function") {
      navigator.sendBeacon("/api/articles/view", payload);
      return;
    }
    fetch("/api/articles/view", {
      method: "POST",
      body: payload,
      keepalive: true,
    }).catch(() => {
      // Best-effort signal; losing a view is fine.
    });
  }, [slug]);

  return null;
}
