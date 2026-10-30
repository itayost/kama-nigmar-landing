import { describe, expect, it } from "vitest";
import { bindClosingMarks, splitShowQuestion } from "./title";

const NBSP = " ";

describe("bindClosingMarks", () => {
  it("joins a question mark to the word before it", () => {
    expect(bindClosingMarks("המיתולוגיה חוזרת ? על נבחרת יוון")).toBe(`המיתולוגיה חוזרת${NBSP}? על נבחרת יוון`);
  });

  it("joins an exclamation mark the same way", () => {
    expect(bindClosingMarks("ליגת אלופות חוזרת !")).toBe(`ליגת אלופות חוזרת${NBSP}!`);
  });

  it("joins every mark in the title, and runs of spaces become one", () => {
    expect(bindClosingMarks("לסטר  ? זאת את ?")).toBe(`לסטר${NBSP}? זאת את${NBSP}?`);
  });

  it("binds marks that follow one another", () => {
    expect(bindClosingMarks("מה קרה ! ?")).toBe(`מה קרה${NBSP}!${NBSP}?`);
  });

  it("leaves marks that already touch their word", () => {
    expect(bindClosingMarks("כמה נגמר? 23.10")).toBe("כמה נגמר? 23.10");
  });

  it("leaves a mark that opens the title", () => {
    expect(bindClosingMarks("? פתיחה")).toBe("? פתיחה");
  });
});

describe("splitShowQuestion", () => {
  it("separates the show's question from the rest of the title", () => {
    expect(splitShowQuestion(`כמה נגמר${NBSP}? 23.10.2011`)).toBe("23.10.2011");
    expect(splitShowQuestion("כמה נגמר? נבחרת ארגנטינה ומסי")).toBe("נבחרת ארגנטינה ומסי");
    expect(splitShowQuestion(`כמה נגמר${NBSP}? מחזור ראשון באלופות`)).toBe("מחזור ראשון באלופות");
  });

  it("returns null for a title that does not open with the question", () => {
    expect(splitShowQuestion("סיכום השבוע! 23-27.8")).toBeNull();
  });

  it("returns null when the question is the whole title", () => {
    expect(splitShowQuestion("כמה נגמר ?")).toBeNull();
  });
});
