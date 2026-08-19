import { describe, expect, test } from "vitest";
import { authorAvatarUrl } from "./authors";

describe("authorAvatarUrl", () => {
  test("returns the avatar path for a known author", () => {
    expect(authorAvatarUrl("גיא צינקר")).toBe("/authors/guy-tsinker.webp");
  });

  test("ignores surrounding whitespace in the stored name", () => {
    expect(authorAvatarUrl("  גיא צינקר  ")).toBe("/authors/guy-tsinker.webp");
  });

  test("returns null for an author with no avatar", () => {
    expect(authorAvatarUrl("בודק אוטומטי")).toBeNull();
  });

  test("returns null for inherited Object properties", () => {
    expect(authorAvatarUrl("constructor")).toBeNull();
  });
});
