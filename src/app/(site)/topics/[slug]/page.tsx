import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArticleLeadCard } from "@/components/articles/ArticleLeadCard";
import { ArticleRow } from "@/components/articles/ArticleRow";
import { RailFocus } from "@/components/articles/RailFocus";
import { subjectStyle } from "@/components/articles/subject";
import { JsonLd } from "@/components/seo/JsonLd";
import { ArchiveHeader } from "@/components/ui/ArchiveHeader";
import { getPublishedArticles } from "@/lib/dal/articles";
import { getSubjects } from "@/lib/dal/taxonomy";
import { formatDateLong } from "@/lib/datetime";
import { stallNotFoundOutsidePrerender } from "@/lib/not-found-guard";
import { breadcrumbSchema, collectionPageSchema, FEED_ALTERNATE, pageOpenGraph } from "@/lib/seo/schema";
import { SITE_URL } from "@/lib/site";
import { planSubjectPage, subjectPath, subjectSummary, viaTag, type SubjectSummary } from "@/lib/taxonomy/public";

const PAGE_SIZE = 12;

export async function generateStaticParams() {
  const subjects = await getSubjects();
  return subjects.map((subject) => ({ slug: subject.slug }));
}

async function resolveSubject(slug: string): Promise<SubjectSummary | null> {
  const subjects = await getSubjects();
  return subjects.find((subject) => subject.slug === slug) ?? null;
}

function pageFor(subject: SubjectSummary) {
  return {
    name: subject.name,
    description: subject.description ?? `כל הכתבות, הסיכומים והמדריכים על ${subject.name} מהפודקאסט כמה נגמר?`,
    url: `${SITE_URL}${subjectPath(subject.slug)}`,
  };
}

export async function generateMetadata({ params }: PageProps<"/topics/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const subject = await resolveSubject(slug);
  if (!subject) {
    await stallNotFoundOutsidePrerender();
    return { title: "הנושא לא נמצא", robots: { index: false } };
  }
  const page = pageFor(subject);
  return {
    title: page.name,
    description: page.description,
    // Tag and page filters fold into the subject page.
    alternates: { canonical: page.url, types: FEED_ALTERNATE },
    openGraph: pageOpenGraph(page),
  };
}

function ListSkeleton() {
  return (
    <div className="mt-6 flex animate-pulse flex-col gap-4" aria-hidden="true">
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="h-20 rounded-lg bg-surface" />
      ))}
    </div>
  );
}

async function SubjectContent({ params, searchParams }: PageProps<"/topics/[slug]">) {
  const { slug } = await params;
  const [subject, articles] = await Promise.all([resolveSubject(slug), getPublishedArticles()]);
  if (!subject) {
    await stallNotFoundOutsidePrerender();
    notFound();
  }
  const { lead, latest, total } = subjectSummary(articles, subject);
  const page = pageFor(subject);

  return (
    <main style={subjectStyle(subject.color)} className="mx-auto w-full max-w-5xl px-6 pb-10">
      <JsonLd data={collectionPageSchema(page)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "בית", url: SITE_URL },
          { name: page.name, url: page.url },
        ])}
      />
      <ArchiveHeader title={page.name} description={page.description} color={subject.color}>
        <p className="mt-1 text-sm text-text-muted">
          {total === 1 ? "כתבה אחת" : `${total} כתבות`}
          {latest?.publishedAt ? ` · עודכן ${formatDateLong(latest.publishedAt)}` : ""}
        </p>
      </ArchiveHeader>
      {lead ? <ArticleLeadCard article={lead} as="h2" priority /> : <p className="text-text-muted">עדיין אין כתבות בנושא הזה.</p>}
      <Suspense fallback={<ListSkeleton />}>
        <SubjectList subject={subject} searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function SubjectList({
  subject,
  searchParams,
}: {
  readonly subject: SubjectSummary;
  readonly searchParams: PageProps<"/topics/[slug]">["searchParams"];
}) {
  const { tag, page } = await searchParams;
  const pageNumber = Math.max(1, Math.min(50, Number(typeof page === "string" ? page : 1) || 1));
  const articles = await getPublishedArticles();
  const plan = planSubjectPage(articles, subject, {
    tag: typeof tag === "string" ? tag : undefined,
    limit: PAGE_SIZE * pageNumber,
  });
  const base = subjectPath(subject.slug);
  const withTag = (name: string | null, nextPage?: number) => {
    const query = new URLSearchParams();
    if (name) query.set("tag", name);
    if (nextPage) query.set("page", String(nextPage));
    const search = query.toString();
    return search ? `${base}?${search}` : base;
  };

  return (
    <section aria-labelledby="subject-list-heading" className="mt-7">
      <h2 id="subject-list-heading" className="sr-only">
        כל הכתבות ב{subject.name}
      </h2>
      {plan.rail.length > 0 ? (
        <nav
          id="subject-rail"
          aria-label="סינון לפי תגית"
          className="sticky top-header z-20 -mx-6 flex gap-2 overflow-x-auto border-y border-surface-border bg-bg-start/95 px-6 py-2.5 backdrop-blur-md [scrollbar-width:none] md:mx-0 md:rounded-xl md:border md:px-3"
        >
          <RailChip href={withTag(null)} active={plan.activeTag === null} label="הכל" count={plan.total} />
          {plan.rail.map((entry) => (
            <RailChip
              key={entry.name}
              href={withTag(entry.name)}
              active={plan.activeTag === entry.name}
              label={entry.name}
              count={entry.count}
            />
          ))}
          <RailFocus railId="subject-rail" active={plan.activeTag} />
        </nav>
      ) : null}
      <div className="mt-2 grid gap-x-8 lg:grid-cols-2">
        {plan.items.map((article) => {
          const via = viaTag(article, subject);
          return (
            <ArticleRow
              key={article.id}
              article={article}
              showSubtitle
              note={via && article.format === "roundup" ? `כולל את ${via.name}` : undefined}
              phEvent="topic_list_click"
            />
          );
        })}
      </div>
      {plan.items.length === 0 ? <p className="py-8 text-center text-text-muted">אין עוד כתבות בנושא הזה</p> : null}
      {plan.hasMore ? (
        <Link
          href={withTag(plan.activeTag, pageNumber + 1)}
          scroll={false}
          className="mt-6 block rounded-xl border border-[var(--subject)]/45 py-3 text-center text-sm font-bold text-[var(--subject)] transition-colors hover:bg-[var(--subject)]/10"
        >
          עוד כתבות
        </Link>
      ) : null}
    </section>
  );
}

function RailChip({
  href,
  active,
  label,
  count,
}: {
  readonly href: string;
  readonly active: boolean;
  readonly label: string;
  readonly count: number;
}) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? "page" : undefined}
      className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm whitespace-nowrap transition-colors ${
        active
          ? "border-[var(--subject)] bg-[var(--subject)] font-bold text-bg-start"
          : "border-surface-border text-text-muted hover:border-[var(--subject)]/60 hover:text-white"
      }`}
    >
      {label}
      <span className="text-[0.8em] tabular-nums opacity-75">{count}</span>
    </Link>
  );
}

export default function SubjectPage(props: PageProps<"/topics/[slug]">) {
  return (
    <Suspense fallback={<ListSkeleton />}>
      <SubjectContent {...props} />
    </Suspense>
  );
}
