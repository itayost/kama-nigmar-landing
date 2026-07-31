import { describe, expect, test } from "vitest";
import { pollInputSchema, voteInputSchema } from "./schema";

describe("pollInputSchema", () => {
  test("accepts a valid poll and trims labels", () => {
    const result = pollInputSchema.safeParse({
      question: "  מי מנצח הערב?  ",
      optionLabels: [" מכבי ", "הפועל"],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.question).toBe("מי מנצח הערב?");
      expect(result.data.optionLabels).toEqual(["מכבי", "הפועל"]);
    }
  });

  test("requires a question with a Hebrew error", () => {
    const result = pollInputSchema.safeParse({ question: "  ", optionLabels: ["א", "ב"] });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("חובה למלא שאלה");
    }
  });

  test("requires between two and four options", () => {
    expect(
      pollInputSchema.safeParse({ question: "ש", optionLabels: ["רק אחת"] }).success,
    ).toBe(false);
    expect(
      pollInputSchema.safeParse({
        question: "ש",
        optionLabels: ["א", "ב", "ג", "ד", "ה"],
      }).success,
    ).toBe(false);
  });

  test("rejects overlong labels and questions", () => {
    expect(
      pollInputSchema.safeParse({ question: "ש", optionLabels: ["א".repeat(51), "ב"] })
        .success,
    ).toBe(false);
    expect(
      pollInputSchema.safeParse({ question: "ש".repeat(201), optionLabels: ["א", "ב"] })
        .success,
    ).toBe(false);
  });
});

describe("voteInputSchema", () => {
  test("accepts a uuid poll id with an option id", () => {
    expect(
      voteInputSchema.safeParse({
        pollId: "00000000-0000-4000-8000-000000000000",
        optionId: "abc",
      }).success,
    ).toBe(true);
  });

  test("rejects non-uuid poll ids and empty options", () => {
    expect(
      voteInputSchema.safeParse({ pollId: "not-a-uuid", optionId: "abc" }).success,
    ).toBe(false);
    expect(
      voteInputSchema.safeParse({
        pollId: "00000000-0000-4000-8000-000000000000",
        optionId: "",
      }).success,
    ).toBe(false);
  });
});
