"use client";

import { useEffect, useRef } from "react";

// Lives in a player stand-in (the episode row) and marks it data-away once it
// leaves the screen, which brings the Player bar up (the docked variant in
// globals.css). Space under the sticky header counts as off screen.
export function PlayerDock() {
  const marker = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const standIn = marker.current?.closest<HTMLElement>("[data-player-stand-in]");
    if (!standIn) return;
    const headerHeight = document.querySelector<HTMLElement>("[data-site-header]")?.offsetHeight ?? 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) delete standIn.dataset.away;
        else standIn.dataset.away = "";
      },
      { rootMargin: `-${headerHeight}px 0px 0px 0px` },
    );
    observer.observe(standIn);
    return () => {
      observer.disconnect();
      delete standIn.dataset.away;
    };
  }, []);

  return <span ref={marker} hidden />;
}
