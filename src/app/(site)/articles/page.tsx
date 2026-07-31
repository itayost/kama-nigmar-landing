import type { Metadata } from "next";
import { Suspense } from "react";
import { ArticleMiniCard } from "@/components/articles/ArticleMiniCard";
import { ArticlesGrid } from "@/components/articles/ArticlesGrid";
import { TagFilterBar } from "@/components/articles/TagFilterBar";
import { JsonLd } from "@/components/seo/JsonLd";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  getAllTags,
  getPublishedArticles,
  getTrendingArticles,
} from "@/lib/dal/articles";
import { FEED_ALTERNATE, breadcrumbSchema } from "@/lib/seo/schema";
import { SITE_URL } from "@/lib/site";

const pageDescription = "כתבות, סיכומים וסרטונים מעולם הספורט — מהפודקאסט כמה נגמר?";
const pageUrl = `${SITE_URL}/articles`;

export const metadata: Metadata = {
  title: "כתבות",
  description: pageDescription,
  // Static canonical also folds ?tag= filtered views into the index page.
  alternates: { canonical: pageUrl, types: FEED_ALTERNATE },
  openGraph: {
    title: "כתבות | כמה נגמר?",
    description: pageDescription,
    url: pageUrl,
    siteName: "כמה נגמר?",
    type: "website",
    locale: "he_IL",
    images: [{ url: "/og-image.jpg", width: 1200, height: 1200, alt: "כמה נגמר? פודקאסט" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "כתבות | כמה נגמר?",
    description: pageDescription,
    images: ["/og-image.jpg"],
  },
};

function ArticlesSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
      {Array.from({ length: 6 }, (_, i) => (
        <div
          key={i}
          className="aspect-[4/3] animate-pulse rounded-xl border border-surface-border bg-surface"
        />
      ))}
    </div>
  );
}

async function TrendingStrip() {
  const trending = await getTrendingArticles(3);
  if (trending.length === 0) return null;

  return (
    <section aria-labelledby="trending-strip-heading" className="mb-8">
      <SectionHeading title="הנקראות ביותר" id="trending-strip-heading" />
      <div className="grid gap-3 sm:grid-cols-3">
        {trending.map((article) => (
          <ArticleMiniCard
            key={article.id}
            article={article}
            phEvent="trending_index_click"
          />
        ))}
      </div>
    </section>
  );
}

async function FilteredArticles({
  searchParams,
}: {
  readonly searchParams: PageProps<"/articles">["searchParams"];
}) {
  const { tag } = await searchParams;
  const requestedTag = typeof tag === "string" && tag !== "" ? tag : undefined;
  // Only known tags reach the per-tag query: getPublishedArticles caches one
  // entry per distinct argument with cacheLife("max"), so arbitrary ?tag=
  // values must not be allowed to mint unbounded cache entries.
  const tags = await getAllTags();
  const activeTag =
    requestedTag !== undefined && tags.includes(requestedTag)
      ? requestedTag
      : undefined;
  const articles = await getPublishedArticles(activeTag);

  return (
    <div className="flex flex-col gap-6">
      <TagFilterBar tags={tags} activeTag={activeTag} />
      {articles.length === 0 ? (
        <p className="rounded-xl border border-dashed border-surface-border p-12 text-center text-text-muted">
          {activeTag ? "אין כתבות בתגית הזו" : "עדיין אין כתבות — חזרו בקרוב"}
        </p>
      ) : (
        <ArticlesGrid articles={articles} />
      )}
    </div>
  );
}

export default function ArticlesPage({ searchParams }: PageProps<"/articles">) {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <JsonLd
        data={breadcrumbSchema([
          { name: "בית", url: SITE_URL },
          { name: "כתבות", url: pageUrl },
        ])}
      />
      <SectionHeading title="כתבות" as="h1" />
      <TrendingStrip />
      <Suspense fallback={<ArticlesSkeleton />}>
        <FilteredArticles searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
