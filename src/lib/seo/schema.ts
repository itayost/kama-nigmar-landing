import type { Article } from "@/lib/db/schema";
import { SITE_URL } from "@/lib/site";

const SITE_NAME = "כמה נגמר?";
const FALLBACK_IMAGE = `${SITE_URL}/og-image.jpg`;

// `alternates` is replaced wholesale when a page defines it, so every page
// that sets a canonical must re-include the feed alternate.
export const FEED_ALTERNATE = { "application/rss+xml": "/feed.xml" } as const;

export function webSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: "he",
  };
}

interface PodcastPlatforms {
  readonly spotifyUrl: string;
  readonly applePodcastUrl: string;
}

export function podcastSeriesSchema({ spotifyUrl, applePodcastUrl }: PodcastPlatforms) {
  return {
    "@context": "https://schema.org",
    "@type": "PodcastSeries",
    name: SITE_NAME,
    description:
      "פודקאסט ספורט יומי ומהיר — התקציר של כל מה שקרה אתמול בספורט, בישראל ובעולם.",
    url: SITE_URL,
    image: `${SITE_URL}/cover.png`,
    inLanguage: "he",
    sameAs: [spotifyUrl, applePodcastUrl].filter((url) => url !== "#"),
  };
}

export function newsArticleSchema(article: Article) {
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.subtitle ?? undefined,
    image: [article.coverImageUrl ?? FALLBACK_IMAGE],
    datePublished: article.publishedAt?.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    author: { "@type": "Person", name: article.authorName },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/icon-512.png` },
    },
    mainEntityOfPage: `${SITE_URL}/articles/${article.slug}`,
    inLanguage: "he",
    articleSection: article.tags[0],
    keywords: article.tags.length > 0 ? article.tags.join(", ") : undefined,
  };
}

export interface BreadcrumbItem {
  readonly name: string;
  readonly url: string;
}

export function breadcrumbSchema(items: readonly BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
