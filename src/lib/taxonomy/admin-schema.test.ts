import { describe, expect, it } from "vitest";
import { subjectInputSchema, tagInputSchema } from "./admin-schema";

const SUBJECT = "11111111-1111-4111-8111-111111111111";

describe("subjectInputSchema", () => {
  const valid = { name: "כדורגל ישראלי", slug: "israeli-football", color: "#4CB8FF", description: "" };

  it("accepts a subject and normalizes its color and empty description", () => {
    expect(subjectInputSchema.parse(valid)).toEqual({
      name: "כדורגל ישראלי",
      slug: "israeli-football",
      color: "#4cb8ff",
      description: null,
    });
  });

  it("requires an English URL slug", () => {
    for (const slug of ["כדורגל", "Israeli Football", "israeli--football", "-football", ""]) {
      expect(subjectInputSchema.safeParse({ ...valid, slug }).success, slug).toBe(false);
    }
  });

  it("requires a full hex color", () => {
    expect(subjectInputSchema.safeParse({ ...valid, color: "blue" }).success).toBe(false);
    expect(subjectInputSchema.safeParse({ ...valid, color: "#4cb" }).success).toBe(false);
  });

  it("explains a missing name in Hebrew", () => {
    const result = subjectInputSchema.safeParse({ ...valid, name: "  " });
    expect(result.success ? "" : result.error.issues[0].message).toBe("חובה למלא שם נושא");
  });
});

describe("tagInputSchema", () => {
  it("accepts a tag for a subject or for the inbox", () => {
    expect(tagInputSchema.parse({ name: " ליגת העל ", subjectId: SUBJECT })).toEqual({
      name: "ליגת העל",
      subjectId: SUBJECT,
    });
    expect(tagInputSchema.parse({ name: "ליגיונרים", subjectId: null }).subjectId).toBeNull();
  });

  it("rejects a malformed subject id", () => {
    expect(tagInputSchema.safeParse({ name: "תגית", subjectId: "football" }).success).toBe(false);
  });
});
