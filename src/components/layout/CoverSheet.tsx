import type { ReactNode } from "react";
import { HeaderSolidity } from "./HeaderSolidity";

interface CoverSheetProps {
  // The full-bleed cover. It sits under the floating header, and anything
  // placed at its bottom should clear var(--sheet-overlap).
  readonly cover: ReactNode;
  // Sets --sheet-overlap, how far the sheet climbs over the cover.
  readonly overlapClassName: string;
  readonly sheetAs?: "article" | "div";
  readonly sheetClassName?: string;
  readonly children: ReactNode;
}

// A page that opens on a full-bleed cover with a rounded sheet riding up over
// it, on an article and on the homepage. data-cover-sheet floats the header
// over the cover (the over-cover variant) until HeaderSolidity, at the top of
// the sheet, reaches it.
export function CoverSheet({ cover, overlapClassName, sheetAs: Sheet = "div", sheetClassName = "", children }: CoverSheetProps) {
  return (
    <main data-cover-sheet className={`-mt-header ${overlapClassName}`}>
      {cover}
      <Sheet
        className={`relative z-10 mt-[calc(var(--sheet-overlap)*-1)] rounded-t-[1.625rem] bg-[linear-gradient(180deg,#0c1a30_0%,var(--color-bg-start)_15rem,var(--color-bg-end)_100%)] shadow-[0_-24px_48px_-20px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.09)] md:rounded-t-[1.75rem] ${sheetClassName}`}
      >
        <HeaderSolidity />
        {children}
      </Sheet>
    </main>
  );
}
