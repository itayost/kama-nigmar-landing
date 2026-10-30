"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

// On an article with a full-bleed cover the header floats over the photo.
// Once the article's sheet reaches the header, the header turns solid again.
export function HeaderSolidity() {
  const pathname = usePathname();

  useEffect(() => {
    const header = document.querySelector<HTMLElement>("[data-site-header]");
    const sheetTop = document.querySelector("[data-sheet-top]");
    if (!header) return;
    if (!sheetTop) {
      header.dataset.solid = "";
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        const passed = !entry.isIntersecting && entry.boundingClientRect.top < header.offsetHeight;
        if (passed) header.dataset.solid = "";
        else delete header.dataset.solid;
      },
      { rootMargin: `-${header.offsetHeight}px 0px 0px 0px` },
    );
    observer.observe(sheetTop);
    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
