import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArticlesGrid } from "@/components/articles/ArticlesGrid";
import { subjectStyle } from "@/components/articles/subject";
import { JsonLd } from "@/components/seo/JsonLd";
import { ArchiveHeader } from "@/components/ui/ArchiveHeader";
import { getPublishedArticles } from "@/lib/dal/articles";
import { getNavigation } from "@/lib/dal/navigation";
import { FEED_ALTERNATE, breadcrumbSchema, pageOpenGraph } from "@/lib/seo/schema";
import { SITE_URL } from "@/lib/site";

const pageDescription = "כתבות, סיכומים וסרטונים מעולם הספורט — מהפודקאסט כמה נגמר?";
const pageUrl = `${SITE_URL}/articles`;

export const metadata: Metadata = {
  title: "כתבות",
  description: pageDescription,
  alternates: { canonical: pageUrl, types: FEED_ALTERNATE },
  openGraph: pageOpenGraph({ name: "כתבות", description: pageDescription, url: pageUrl }),
  twitter: {
    card: "summary_large_image",
    title: "כתבות | כמה נגמר?",
    description: pageDescription,
    images: ["/og-wide.jpg"],
  },
};

function ArticlesSkeleton() {
  return (
    <div className="flex flex-col gap-3 sm:grid sm:grid-cols-2 sm:gap-5 lg:grid-cols-3" aria-hidden="true">
      {Array.from({ length: 6 }, (_, i) => (
        <div
          key={i}
          className="h-20 animate-pulse rounded-xl border border-surface-border bg-surface sm:aspect-[4/3] sm:h-auto"
        />
      ))}
    </div>
  );
}

// The archive's only filter is the subject: each chip opens that subject's
// page. One scrolling row on a phone, like the subject page's tag rail.
async function SubjectChips() {
  const { sections } = await getNavigation();

  return (
    <nav
      aria-label="נושאים"
      className="-mx-6 mb-8 flex gap-2 overflow-x-auto px-6 pb-1 [scrollbar-width:none] md:mx-0 md:flex-wrap md:overflow-visible md:px-0"
    >
      {sections.map((chip) => (
        <Link
          key={chip.href}
          href={chip.href}
          style={subjectStyle(chip.color)}
          className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-surface-border px-3.5 py-1.5 text-sm transition-colors hover:border-[var(--subject)]/60 hover:bg-[var(--subject)]/10"
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

async function ArchiveMasthead() {
  const { total } = await getNavigation();
  return (
    <ArchiveHeader title="כל הכתבות" description={pageDescription} color="var(--color-accent)">
      <p className="mt-1 text-sm text-text-muted">{total === 1 ? "כתבה אחת" : `${total} כתבות`} · מהחדשה לישנה</p>
    </ArchiveHeader>
  );
}

export default function ArticlesPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 pb-10">
      <JsonLd
        data={breadcrumbSchema([
          { name: "בית", url: SITE_URL },
          { name: "כתבות", url: pageUrl },
        ])}
      />
      <ArchiveMasthead />
      <SubjectChips />
      <Suspense fallback={<ArticlesSkeleton />}>
        <AllArticles />
      </Suspense>
    </main>
  );
}
