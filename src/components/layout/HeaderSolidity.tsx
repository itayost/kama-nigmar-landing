"use client";

import { useEffect, useRef } from "react";

// Marks the top of an article's sheet. Over the cover the header floats on a
// shade; once the sheet reaches the header, the header turns solid again.
// It lives inside the sheet, so it only runs once the sheet is on the page.
export function HeaderSolidity() {
  const marker = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const header = document.querySelector<HTMLElement>("[data-site-header]");
    const sheetTop = marker.current;
    if (!header || !sheetTop) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        const passed = !entry.isIntersecting && entry.boundingClientRect.top < header.offsetHeight;
        if (passed) header.dataset.solid = "";
        else delete header.dataset.solid;
      },
      { rootMargin: `-${header.offsetHeight}px 0px 0px 0px` },
    );
    observer.observe(sheetTop);
    return () => {
      observer.disconnect();
      delete header.dataset.solid;
    };
  }, []);

  return <span ref={marker} aria-hidden="true" className="absolute top-0" />;
}
