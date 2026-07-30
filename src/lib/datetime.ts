// All article dates are presented and interpreted in Israel time, matching
// the site's audience. Formatting through a fixed time zone keeps server
// prerender and client hydration output identical regardless of runtime TZ.
const ISRAEL_TIME_ZONE = "Asia/Jerusalem";

const longDateFormatter = new Intl.DateTimeFormat("he-IL", {
  timeZone: ISRAEL_TIME_ZONE,
  dateStyle: "long",
});

const shortDateFormatter = new Intl.DateTimeFormat("he-IL", {
  timeZone: ISRAEL_TIME_ZONE,
  dateStyle: "short",
});

const israelPartsFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: ISRAEL_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

const DATETIME_LOCAL_PATTERN = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/;

export function formatDateLong(date: Date): string {
  return longDateFormatter.format(date);
}

export function formatDateShort(date: Date): string {
  return shortDateFormatter.format(date);
}

interface WallClockParts {
  readonly year: number;
  readonly month: number;
  readonly day: number;
  readonly hour: number;
  readonly minute: number;
  readonly second: number;
}

function israelWallClock(at: Date): WallClockParts {
  const parts: Partial<Record<Intl.DateTimeFormatPartTypes, string>> = {};
  for (const part of israelPartsFormatter.formatToParts(at)) {
    parts[part.type] = part.value;
  }
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second),
  };
}

function israelOffsetMs(at: Date): number {
  const wall = israelWallClock(at);
  const wallAsUtc = Date.UTC(
    wall.year,
    wall.month - 1,
    wall.day,
    wall.hour,
    wall.minute,
    wall.second,
  );
  const truncated = Math.floor(at.getTime() / 1000) * 1000;
  return wallAsUtc - truncated;
}

/**
 * Formats a Date as a datetime-local input value ("YYYY-MM-DDTHH:mm")
 * in Israel time. Deterministic across server and client.
 */
export function toDatetimeLocalIsrael(date: Date | null | undefined): string {
  if (!date) return "";
  const wall = israelWallClock(date);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${wall.year}-${pad(wall.month)}-${pad(wall.day)}T${pad(wall.hour)}:${pad(wall.minute)}`;
}

/**
 * Parses a datetime-local input value ("YYYY-MM-DDTHH:mm") as Israel wall
 * time and returns the corresponding instant. Returns null for input that
 * does not match the datetime-local format.
 */
export function parseDatetimeLocalIsrael(value: string): Date | null {
  const match = DATETIME_LOCAL_PATTERN.exec(value.trim());
  if (!match) return null;

  const [, year, month, day, hour, minute] = match;
  const wallAsUtc = Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
  );

  // The offset depends on the instant (DST), which depends on the offset.
  // One refinement pass settles everything except the ambiguous hour at a
  // DST transition, where either reading is acceptable.
  const firstGuess = new Date(wallAsUtc - israelOffsetMs(new Date(wallAsUtc)));
  const refinedOffset = israelOffsetMs(firstGuess);
  const result = new Date(wallAsUtc - refinedOffset);
  return Number.isNaN(result.getTime()) ? null : result;
}
