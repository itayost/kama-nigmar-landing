"use client";

import { iconButtonClass } from "../Field";
import { ChevronLeftIcon, ChevronRightIcon } from "../icons";

interface ColumnControlsProps {
  readonly onHomepage: boolean;
  readonly isFirst: boolean;
  readonly isLast: boolean;
  onToggleHomepage(): void;
  onReorder(direction: -1 | 1): void;
}

// The homepage switch and the order arrows under a subject's name.
export function ColumnControls({ onHomepage, isFirst, isLast, onToggleHomepage, onReorder }: ColumnControlsProps) {
  return (
    <div className="flex items-center gap-1 text-xs text-text-muted">
      <button
        type="button"
        role="switch"
        aria-checked={onHomepage}
        onClick={onToggleHomepage}
        className="flex items-center gap-1.5 whitespace-nowrap rounded-md py-1 pe-1.5 hover:text-white"
      >
        <span aria-hidden="true" className={`relative h-4 w-7 rounded-full transition-colors ${onHomepage ? "bg-accent" : "bg-white/20"}`}>
          <span
            className={`absolute top-0.5 h-3 w-3 rounded-full bg-bg-start transition-[inset-inline-start] ${
              onHomepage ? "start-[0.85rem]" : "start-0.5"
            }`}
          />
        </span>
        בעמוד הבית
      </button>
      <span className="ms-auto flex">
        <button type="button" disabled={isFirst} onClick={() => onReorder(-1)} aria-label="הקדמה" className={iconButtonClass}>
          <ChevronRightIcon />
        </button>
        <button type="button" disabled={isLast} onClick={() => onReorder(1)} aria-label="הזזה אחורה" className={iconButtonClass}>
          <ChevronLeftIcon />
        </button>
      </span>
    </div>
  );
}
