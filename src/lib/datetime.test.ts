import { describe, expect, test } from "vitest";
import { formatWeekday, parseDatetimeLocalIsrael, toDatetimeLocalIsrael } from "./datetime";

describe("toDatetimeLocalIsrael", () => {
  test("formats winter instants at IST (+2)", () => {
    expect(toDatetimeLocalIsrael(new Date("2026-01-15T10:00:00Z"))).toBe(
      "2026-01-15T12:00",
    );
  });

  test("formats summer instants at IDT (+3)", () => {
    expect(toDatetimeLocalIsrael(new Date("2026-07-30T12:34:00Z"))).toBe(
      "2026-07-30T15:34",
    );
  });

  test("returns empty string for null and undefined", () => {
    expect(toDatetimeLocalIsrael(null)).toBe("");
    expect(toDatetimeLocalIsrael(undefined)).toBe("");
  });
});

describe("parseDatetimeLocalIsrael", () => {
  test("parses summer wall time as IDT (+3)", () => {
    expect(parseDatetimeLocalIsrael("2026-07-30T15:34")?.toISOString()).toBe(
      "2026-07-30T12:34:00.000Z",
    );
  });

  test("parses winter wall time as IST (+2)", () => {
    expect(parseDatetimeLocalIsrael("2026-01-15T12:00")?.toISOString()).toBe(
      "2026-01-15T10:00:00.000Z",
    );
  });

  test("round-trips through the formatter without drifting", () => {
    const original = new Date("2026-07-30T12:34:00.000Z");
    const roundTripped = parseDatetimeLocalIsrael(toDatetimeLocalIsrael(original));
    expect(roundTripped?.getTime()).toBe(original.getTime());
  });

  test("rejects malformed input", () => {
    expect(parseDatetimeLocalIsrael("")).toBeNull();
    expect(parseDatetimeLocalIsrael("not a date")).toBeNull();
    expect(parseDatetimeLocalIsrael("2026-07-30")).toBeNull();
    expect(parseDatetimeLocalIsrael("2026-07-30T15:34:00Z")).toBeNull();
  });
});

describe("formatWeekday", () => {
  test("names the day in Hebrew", () => {
    expect(formatWeekday(new Date("2026-09-11T06:00:00Z"))).toBe("שישי");
    expect(formatWeekday(new Date("2026-08-23T09:00:00Z"))).toBe("ראשון");
  });

  test("uses the day in Israel, not in UTC", () => {
    // 22:30 UTC on Friday is already 01:30 on Saturday in Israel.
    expect(formatWeekday(new Date("2026-09-11T22:30:00Z"))).toBe("שבת");
  });
});
