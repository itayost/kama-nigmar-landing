"use client";

import { useEffect } from "react";

// A filtered rail can start with its active chip scrolled off a phone screen.
// Brings it into view without moving the page.
export function RailFocus({ railId, active }: { readonly railId: string; readonly active: string | null }) {
  useEffect(() => {
    const rail = document.getElementById(railId);
    const chip = rail?.querySelector<HTMLElement>("[aria-current=page]");
    if (!rail || !chip) return;
    const offset = chip.offsetLeft - (rail.clientWidth - chip.offsetWidth) / 2;
    rail.scrollTo({ left: offset, behavior: "instant" });
  }, [railId, active]);

  return null;
}
