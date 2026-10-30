import { describe, expect, it } from "vitest";
import { bindClosingMarks } from "./title";

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
