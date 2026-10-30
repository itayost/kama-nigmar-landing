import { describe, expect, it } from "vitest";
import { otherSubjects, suggestPrimarySubject } from "./suggest";

const il = "israeli-football";
const wf = "world-football";
const bb = "basketball";

describe("suggestPrimarySubject", () => {
  it("picks the subject most of the tags belong to", () => {
    expect(suggestPrimarySubject([wf, il, il], "story")).toBe(il);
  });

  it("breaks a tie in favor of the first tag's subject", () => {
    expect(suggestPrimarySubject([il, wf], "story")).toBe(il);
    expect(suggestPrimarySubject([wf, il], "story")).toBe(wf);
  });

  it("ignores tags still waiting in the inbox", () => {
    expect(suggestPrimarySubject([null, bb], "story")).toBe(bb);
    expect(suggestPrimarySubject([null], "story")).toBeNull();
  });

  it("gives a roundup a primary subject only when all its tags share one", () => {
    expect(suggestPrimarySubject([wf, wf], "roundup")).toBe(wf);
    expect(suggestPrimarySubject([il, bb], "roundup")).toBeNull();
  });
});

describe("otherSubjects", () => {
  it("lists the tag subjects besides the primary one, in tag order", () => {
    expect(otherSubjects([bb, il, null, bb, wf], il)).toEqual([bb, wf]);
  });

  it("lists every tag subject when there is no primary subject", () => {
    expect(otherSubjects([il, bb], null)).toEqual([il, bb]);
  });
});
