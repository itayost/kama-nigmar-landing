import type { MetadataRoute } from "next";
import { getPublishedArticles } from "@/lib/dal/articles";
import { getSubjects } from "@/lib/dal/taxonomy";
import { SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, subjects] = await Promise.all([getPublishedArticles(), getSubjects()]);

  return [
    {
      url: SITE_URL,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/articles`,
      changeFrequency: "daily",
      priority: 0.8,
    },
    ...subjects.map((subject) => ({
      url: `${SITE_URL}/topics/${subject.slug}`,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
    {
      url: `${SITE_URL}/roundups`,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/terms`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/privacy`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    ...articles.map((article) => ({
      url: `${SITE_URL}/articles/${article.number}`,
      lastModified: article.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
