import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArticleMiniCard } from "@/components/articles/ArticleMiniCard";
import { ArticlesGrid } from "@/components/articles/ArticlesGrid";
import { subjectStyle } from "@/components/articles/subject";
import { JsonLd } from "@/components/seo/JsonLd";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getPublishedArticles, getTrendingArticles } from "@/lib/dal/articles";
import { getNavigation } from "@/lib/dal/navigation";
import { FEED_ALTERNATE, breadcrumbSchema } from "@/lib/seo/schema";
import { SITE_URL } from "@/lib/site";

const pageDescription = "כתבות, סיכומים וסרטונים מעולם הספורט — מהפודקאסט כמה נגמר?";
const pageUrl = `${SITE_URL}/articles`;

export const metadata: Metadata = {
  title: "כתבות",
  description: pageDescription,
  alternates: { canonical: pageUrl, types: FEED_ALTERNATE },
  openGraph: {
    title: "כתבות | כמה נגמר?",
    description: pageDescription,
    url: pageUrl,
    siteName: "כמה נגמר?",
    type: "website",
    locale: "he_IL",
    images: [{ url: "/og-wide.jpg", width: 1200, height: 630, alt: "כמה נגמר? פודקאסט" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "כתבות | כמה נגמר?",
    description: pageDescription,
    images: ["/og-wide.jpg"],
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

// The archive's only filter is the subject: each chip opens that subject's page.
async function SubjectChips() {
  const { subjects, roundups } = await getNavigation();
  const chips = [
    ...subjects.map((subject) => ({ href: `/topics/${subject.slug}`, label: subject.name, color: subject.color, count: subject.count })),
    { href: "/roundups", label: "סיכומים", color: "#ffffff", count: roundups.count },
  ];

  return (
    <nav aria-label="נושאים" className="mb-8 flex flex-wrap gap-2">
      {chips.map((chip) => (
        <Link
          key={chip.href}
          href={chip.href}
          style={subjectStyle(chip.color)}
          className="flex items-center gap-2 rounded-full border border-surface-border px-3.5 py-1.5 text-sm transition-colors hover:border-[var(--subject)]/60 hover:bg-[var(--subject)]/10"
        >
          <span aria-hidden="true" className="h-2.5 w-2.5 rounded-[3px] bg-[var(--subject)]" />
          {chip.label}
          <span className="text-[0.8em] tabular-nums text-text-muted">{chip.count}</span>
        </Link>
      ))}
    </nav>
  );
}

async function AllArticles() {
  const articles = await getPublishedArticles();
  if (articles.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-surface-border p-12 text-center text-text-muted">
        עדיין אין כתבות — חזרו בקרוב
      </p>
    );
  }
  return <ArticlesGrid articles={articles} />;
}

export default function ArticlesPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <JsonLd
        data={breadcrumbSchema([
          { name: "בית", url: SITE_URL },
          { name: "כתבות", url: pageUrl },
        ])}
      />
      <SectionHeading title="כל הכתבות" as="h1" />
      <SubjectChips />
      <TrendingStrip />
      <Suspense fallback={<ArticlesSkeleton />}>
        <AllArticles />
      </Suspense>
    </main>
  );
}
