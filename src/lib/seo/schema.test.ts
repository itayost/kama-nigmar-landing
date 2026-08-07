import { describe, expect, test } from "vitest";
import type { Article } from "@/lib/db/schema";
import { SITE_URL } from "@/lib/site";
import {
  breadcrumbSchema,
  newsArticleSchema,
  podcastSeriesSchema,
  webSiteSchema,
} from "./schema";

const baseArticle: Article = {
  id: "00000000-0000-0000-0000-000000000000",
  number: 1,
  slug: "test-article",
  title: "כותרת בדיקה",
  subtitle: "כותרת משנה",
  coverImageUrl: "https://abc.public.blob.vercel-storage.com/articles/pic.jpg",
  content: [],
  authorName: "יוסי",
  episodeUrl: null,
  pollId: null,
  tags: ["כדורגל", "ליגת העל"],
  status: "published",
  views: 0,
  publishedAt: new Date("2026-07-30T10:00:00Z"),
  createdAt: new Date("2026-07-29T10:00:00Z"),
  updatedAt: new Date("2026-07-30T12:00:00Z"),
};

describe("webSiteSchema", () => {
  test("has correct type and absolute url", () => {
    const schema = webSiteSchema();
    expect(schema["@type"]).toBe("WebSite");
    expect(schema.url).toBe(SITE_URL);
    expect(schema.inLanguage).toBe("he");
  });
});

describe("podcastSeriesSchema", () => {
  test("includes platform links in sameAs", () => {
    const schema = podcastSeriesSchema({
      spotifyUrl: "https://open.spotify.com/show/x",
      applePodcastUrl: "https://podcasts.apple.com/y",
    });
    expect(schema["@type"]).toBe("PodcastSeries");
    expect(schema.sameAs).toEqual([
      "https://open.spotify.com/show/x",
      "https://podcasts.apple.com/y",
    ]);
    expect(schema.image).toBe(`${SITE_URL}/cover.png`);
  });

  test("drops unset (#) platform links", () => {
    const schema = podcastSeriesSchema({ spotifyUrl: "#", applePodcastUrl: "#" });
    expect(schema.sameAs).toEqual([]);
  });
});

describe("newsArticleSchema", () => {
  test("maps article fields with ISO dates", () => {
    const schema = newsArticleSchema(baseArticle);
    expect(schema["@type"]).toBe("NewsArticle");
    expect(schema.headline).toBe("כותרת בדיקה");
    expect(schema.image).toEqual([baseArticle.coverImageUrl]);
    expect(schema.datePublished).toBe("2026-07-30T10:00:00.000Z");
    expect(schema.dateModified).toBe("2026-07-30T12:00:00.000Z");
    expect(schema.author).toEqual({ "@type": "Person", name: "יוסי" });
    expect(schema.mainEntityOfPage).toBe(`${SITE_URL}/articles/1`);
    expect(schema.articleSection).toBe("כדורגל");
    expect(schema.keywords).toBe("כדורגל, ליגת העל");
  });

  test("falls back to the brand OG image without a cover", () => {
    const schema = newsArticleSchema({ ...baseArticle, coverImageUrl: null });
    expect(schema.image).toEqual([`${SITE_URL}/og-image.jpg`]);
  });

  test("omits keywords when there are no tags", () => {
    const schema = newsArticleSchema({ ...baseArticle, tags: [] });
    expect(schema.keywords).toBeUndefined();
    expect(schema.articleSection).toBeUndefined();
  });
});

describe("breadcrumbSchema", () => {
  test("builds 1-indexed positions", () => {
    const schema = breadcrumbSchema([
      { name: "בית", url: SITE_URL },
      { name: "כתבות", url: `${SITE_URL}/articles` },
    ]);
    expect(schema.itemListElement).toEqual([
      { "@type": "ListItem", position: 1, name: "בית", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "כתבות", item: `${SITE_URL}/articles` },
    ]);
  });
});
