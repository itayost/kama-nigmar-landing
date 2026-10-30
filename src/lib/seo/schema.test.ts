import { describe, expect, test } from "vitest";
import type { Article } from "@/lib/db/schema";
import { SITE_URL } from "@/lib/site";
import {
  breadcrumbSchema,
  collectionPageSchema,
  newsArticleSchema,
  pageOpenGraph,
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
  coverCredit: null,
  coverFocusX: null,
  coverFocusY: null,
  content: [],
  authorName: "יוסי",
  episodeUrl: null,
  pollId: null,
  tags: ["כדורגל", "ליגת העל"],
  primarySubjectId: null,
  format: "story",
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
    const schema = newsArticleSchema(baseArticle, { section: "כדורגל ישראלי", keywords: ["ליגת העל", "הפועל באר שבע"] });
    expect(schema["@type"]).toBe("NewsArticle");
    expect(schema.headline).toBe("כותרת בדיקה");
    expect(schema.image).toEqual([baseArticle.coverImageUrl]);
    expect(schema.datePublished).toBe("2026-07-30T10:00:00.000Z");
    expect(schema.dateModified).toBe("2026-07-30T12:00:00.000Z");
    expect(schema.author).toEqual({ "@type": "Person", name: "יוסי" });
    expect(schema.mainEntityOfPage).toBe(`${SITE_URL}/articles/1`);
    expect(schema.articleSection).toBe("כדורגל ישראלי");
    expect(schema.keywords).toBe("ליגת העל, הפועל באר שבע");
  });

  test("falls back to the brand OG image without a cover", () => {
    const schema = newsArticleSchema({ ...baseArticle, coverImageUrl: null });
    expect(schema.image).toEqual([`${SITE_URL}/og-image.jpg`]);
  });

  test("omits the section and keywords when the article has no subject or tags", () => {
    const schema = newsArticleSchema(baseArticle, { keywords: [] });
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

describe("collectionPageSchema", () => {
  test("describes a listing page as part of the site", () => {
    const schema = collectionPageSchema({ name: "כדורסל", description: "הכל על כדורסל", url: `${SITE_URL}/topics/basketball` });
    expect(schema).toMatchObject({
      "@type": "CollectionPage",
      name: "כדורסל",
      url: `${SITE_URL}/topics/basketball`,
      inLanguage: "he",
      isPartOf: { "@type": "WebSite", url: SITE_URL },
    });
  });
});

describe("pageOpenGraph", () => {
  test("suffixes the title with the site name and points at the page", () => {
    const og = pageOpenGraph({ name: "סיכומים", description: "תיאור", url: `${SITE_URL}/roundups` });
    expect(og.title).toBe("סיכומים | כמה נגמר?");
    expect(og.url).toBe(`${SITE_URL}/roundups`);
    expect(og.locale).toBe("he_IL");
  });
});
