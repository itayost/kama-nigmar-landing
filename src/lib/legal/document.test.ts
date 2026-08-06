import { describe, expect, test } from "vitest";
import { CONTACT_EMAIL } from "@/lib/site";
import type { LegalDocument } from "./document";
import { privacyDocument } from "./privacy";
import { termsDocument } from "./terms";

const documents: ReadonlyArray<[string, LegalDocument]> = [
  ["terms", termsDocument],
  ["privacy", privacyDocument],
];

describe.each(documents)("%s document", (_name, doc) => {
  // Section numbering is rendered from the array index, so a duplicated
  // heading would silently produce two sections with the same name — and
  // duplicated headings also collide as React keys.
  test("has uniquely titled, non-empty sections", () => {
    expect(doc.sections.length).toBeGreaterThan(0);
    const headings = doc.sections.map((section) => section.heading);
    expect(new Set(headings).size).toBe(headings.length);

    for (const section of doc.sections) {
      expect(section.heading.trim()).not.toBe("");
      expect(section.body.length).toBeGreaterThan(0);
      for (const block of section.body) {
        if (block.type === "paragraph") {
          expect(block.text.trim()).not.toBe("");
        } else {
          expect(block.items.length).toBeGreaterThan(0);
          expect(block.items.every((item) => item.trim() !== "")).toBe(true);
        }
      }
    }
  });

  // Rendered as <time dateTime={updatedAt}> and parsed with new Date().
  test("carries a parseable ISO revision date", () => {
    expect(doc.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(Number.isNaN(new Date(doc.updatedAt).getTime())).toBe(false);
  });

  // Both pages must leave a reachable channel: the privacy policy is where
  // access/correction requests land, the terms are where takedowns do.
  test("publishes the contact address", () => {
    const text = doc.sections
      .flatMap((section) => section.body)
      .flatMap((block) => (block.type === "paragraph" ? [block.text] : block.items))
      .join(" ");
    expect(text).toContain(CONTACT_EMAIL);
  });
});
