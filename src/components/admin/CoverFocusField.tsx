"use client";

import Image from "next/image";
import type { MouseEvent } from "react";

export interface CoverFocus {
  readonly x: number;
  readonly y: number;
}

export const CENTER: CoverFocus = { x: 50, y: 50 };

interface CoverFocusFieldProps {
  readonly imageUrl: string;
  readonly focus: CoverFocus | null;
  onChange(focus: CoverFocus | null): void;
}

function clampPercent(value: number): number {
  return Math.round(Math.min(100, Math.max(0, value)));
}

// Picks the part of the cover that must stay visible when a phone crops it to
// a tall shape. Click the photo, or use the two sliders.
export function CoverFocusField({ imageUrl, focus, onChange }: CoverFocusFieldProps) {
  const point = focus ?? CENTER;
  const position = `${point.x}% ${point.y}%`;

  function pick(event: MouseEvent<HTMLButtonElement>) {
    const box = event.currentTarget.getBoundingClientRect();
    onChange({
      x: clampPercent(((event.clientX - box.left) / box.width) * 100),
      y: clampPercent(((event.clientY - box.top) / box.height) * 100),
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end gap-4">
        <button
          type="button"
          onClick={pick}
          aria-label="בחירת נקודת המוקד בתמונה"
          className="relative aspect-video w-full max-w-sm cursor-crosshair overflow-hidden rounded-lg border border-surface-border"
        >
          <Image src={imageUrl} alt="" fill sizes="384px" className="object-cover" />
          <span
            aria-hidden="true"
            className="absolute h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_2px_rgba(0,0,0,0.5)]"
            style={{ left: `${point.x}%`, top: `${point.y}%` }}
          />
        </button>
        <div className="flex items-end gap-3">
          <figure className="flex flex-col items-center gap-1">
            <div className="relative h-32 w-24 overflow-hidden rounded-lg border border-surface-border">
              <Image src={imageUrl} alt="" fill sizes="96px" className="object-cover" style={{ objectPosition: position }} />
            </div>
            <figcaption className="text-xs text-text-muted">בטלפון</figcaption>
          </figure>
          <figure className="flex flex-col items-center gap-1">
            <div className="relative aspect-video w-36 overflow-hidden rounded-lg border border-surface-border">
              <Image src={imageUrl} alt="" fill sizes="144px" className="object-cover" style={{ objectPosition: position }} />
            </div>
            <figcaption className="text-xs text-text-muted">בכרטיס</figcaption>
          </figure>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <label className="flex items-center gap-2">
          אופקי
          <input
            type="range"
            min={0}
            max={100}
            value={point.x}
            onChange={(event) => onChange({ ...point, x: Number(event.target.value) })}
            className="accent-accent"
          />
        </label>
        <label className="flex items-center gap-2">
          אנכי
          <input
            type="range"
            min={0}
            max={100}
            value={point.y}
            onChange={(event) => onChange({ ...point, y: Number(event.target.value) })}
            className="accent-accent"
          />
        </label>
        {focus ? (
          <button type="button" onClick={() => onChange(null)} className="text-text-muted hover:text-white">
            חזרה למרכז
          </button>
        ) : null}
      </div>
    </div>
  );
}
