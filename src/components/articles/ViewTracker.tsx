"use client";

import { useEffect, useRef } from "react";

interface ViewTrackerProps {
  readonly articleNumber: number;
}

export function ViewTracker({ articleNumber }: ViewTrackerProps) {
  const hasFired = useRef(false);

  useEffect(() => {
    if (hasFired.current) return;
    hasFired.current = true;

    const payload = JSON.stringify({ number: articleNumber });
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
  }, [articleNumber]);

  return null;
}
