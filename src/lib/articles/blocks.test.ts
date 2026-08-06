import { describe, expect, test } from "vitest";
import {
  articleInputSchema,
  blockSchema,
  blocksSchema,
  isBlobUrl,
  slugSchema,
  tagNameSchema,
} from "./blocks";

const BLOB_URL = "https://abc123.public.blob.vercel-storage.com/articles/pic.jpg";

const paragraph = { id: "1", type: "paragraph", text: "טקסט" };
const heading = { id: "2", type: "heading", level: 2, text: "כותרת" };
const image = { id: "3", type: "image", url: BLOB_URL, alt: "תמונה" };
const video = {
  id: "4",
  type: "video",
  provider: "youtube",
  url: "https://youtu.be/dQw4w9WgXcQ",
  embedUrl: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
  thumbnailUrl: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
};

describe("isBlobUrl", () => {
  test("accepts only https URLs on the Vercel Blob host", () => {
    expect(isBlobUrl(BLOB_URL)).toBe(true);
    expect(isBlobUrl("https://example.com/pic.jpg")).toBe(false);
    expect(isBlobUrl("http://abc.public.blob.vercel-storage.com/pic.jpg")).toBe(false);
    expect(isBlobUrl("not a url")).toBe(false);
  });
});

describe("blockSchema", () => {
  test("accepts each block type", () => {
    expect(blockSchema.safeParse(paragraph).success).toBe(true);
    expect(blockSchema.safeParse(heading).success).toBe(true);
    expect(blockSchema.safeParse(image).success).toBe(true);
    expect(blockSchema.safeParse(video).success).toBe(true);
  });

  test("rejects unknown block types", () => {
    expect(blockSchema.safeParse({ id: "9", type: "gallery" }).success).toBe(false);
  });

  test("rejects empty paragraph text with a Hebrew message", () => {
    const result = blockSchema.safeParse({ ...paragraph, text: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("חובה למלא טקסט בפסקה");
    }
  });

  test("rejects heading level outside 2-3", () => {
    expect(blockSchema.safeParse({ ...heading, level: 1 }).success).toBe(false);
    expect(blockSchema.safeParse({ ...heading, level: 4 }).success).toBe(false);
  });

  test("rejects image URLs outside the Blob host", () => {
    expect(
      blockSchema.safeParse({ ...image, url: "https://example.com/x.jpg" }).success,
    ).toBe(false);
  });

  test("rejects video with unsupported provider", () => {
    expect(blockSchema.safeParse({ ...video, provider: "vimeo" }).success).toBe(false);
  });
});

describe("blocksSchema", () => {
  test("requires at least one block", () => {
    expect(blocksSchema.safeParse([]).success).toBe(false);
    expect(blocksSchema.safeParse([paragraph]).success).toBe(true);
  });
});

describe("slugSchema", () => {
  const valid = ["a", "abc", "abc-def", "a1-b2-c3", "nba-2026"];
  const invalid = ["", "-abc", "abc-", "ab--cd", "ABC", "עברית", "a b", "a_b", "a".repeat(101)];

  test.each(valid)("accepts %s", (slug) => {
    expect(slugSchema.safeParse(slug).success).toBe(true);
  });

  test.each(invalid)("rejects %j", (slug) => {
    expect(slugSchema.safeParse(slug).success).toBe(false);
  });
});

describe("tagNameSchema", () => {
  test("trims and accepts a valid name", () => {
    const result = tagNameSchema.safeParse("  כדורגל  ");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe("כדורגל");
    }
  });

  test("rejects empty and whitespace-only names with a Hebrew message", () => {
    const result = tagNameSchema.safeParse("   ");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("חובה למלא שם תגית");
    }
  });

  test("rejects names over 30 characters", () => {
    expect(tagNameSchema.safeParse("א".repeat(31)).success).toBe(false);
  });
});

describe("articleInputSchema", () => {
  const validInput = {
    title: "מכבי ניצחה בדרבי",
    subtitle: "סיכום המשחק",
    slug: "maccabi-derby",
    authorName: "יוסי",
    tags: ["כדורגל"],
    status: "draft",
    content: [paragraph],
  };

  test("accepts a valid article", () => {
    expect(articleInputSchema.safeParse(validInput).success).toBe(true);
  });

  test("reports Hebrew errors for missing required fields", () => {
    const result = articleInputSchema.safeParse({ ...validInput, title: "", authorName: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((issue) => issue.message);
      expect(messages).toContain("חובה למלא כותרת");
      expect(messages).toContain("חובה למלא שם כותב");
    }
  });

  test("accepts a linked poll id and rejects a malformed one in Hebrew", () => {
    const pollId = "3b241101-e2bb-4255-8caf-4136c566a962";
    expect(articleInputSchema.safeParse({ ...validInput, pollId }).success).toBe(true);
    expect(articleInputSchema.safeParse(validInput).success).toBe(true);

    const result = articleInputSchema.safeParse({ ...validInput, pollId: "not-a-uuid" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("סקר לא תקין");
    }
  });

  test("limits tags to 10", () => {
    const tags = Array.from({ length: 11 }, (_, i) => `tag${i}`);
    expect(articleInputSchema.safeParse({ ...validInput, tags }).success).toBe(false);
  });

  test("allows empty coverImageUrl but rejects foreign hosts", () => {
    expect(
      articleInputSchema.safeParse({ ...validInput, coverImageUrl: "" }).success,
    ).toBe(true);
    expect(
      articleInputSchema.safeParse({ ...validInput, coverImageUrl: BLOB_URL }).success,
    ).toBe(true);
    expect(
      articleInputSchema.safeParse({ ...validInput, coverImageUrl: "https://evil.com/x.jpg" })
        .success,
    ).toBe(false);
  });
});
