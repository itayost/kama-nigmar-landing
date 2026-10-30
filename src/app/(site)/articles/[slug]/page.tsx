import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { AuthorAvatar } from "@/components/articles/AuthorAvatar";
import { BlockRenderer } from "@/components/articles/BlockRenderer";
import { EpisodeCallout } from "@/components/articles/EpisodeCallout";
import { coverPosition, subjectStyle, SubjectKicker } from "@/components/articles/subject";
import { MidArticleRelated } from "@/components/articles/MidArticleRelated";
import { CoverSheet } from "@/components/layout/CoverSheet";
import { PollSection } from "@/components/polls/PollSection";
import { getPollById } from "@/lib/dal/polls";
import { RecirculationSections } from "@/components/articles/RecirculationSections";
import { ShareButton } from "@/components/articles/ShareButton";
import { ViewTracker } from "@/components/articles/ViewTracker";
import { JsonLd } from "@/components/seo/JsonLd";
import { parseArticleNumber } from "@/lib/articles/article-param";
import { readingTimeLabel } from "@/lib/articles/reading-time";
import {
  getArticleByNumber,
  getPublishedArticles,
  getRecirculation,
  type ArticleDetail,
} from "@/lib/dal/articles";
import { formatDateLong } from "@/lib/datetime";
import { PLACEHOLDER_PARAMS, stallNotFoundOutsidePrerender } from "@/lib/not-found-guard";
import { FEED_ALTERNATE, breadcrumbSchema, newsArticleSchema } from "@/lib/seo/schema";
import { subjectPath } from "@/lib/taxonomy/public";
import { SITE_URL } from "@/lib/site";

const UPDATED_LABEL_THRESHOLD_MS = 24 * 60 * 60 * 1000;

const MID_MODULE_AFTER_BLOCKS = 2;

// Prerenders every article that exists at build time as its own fully static entry. Articles
// published later get the same treatment on their first request, keyed on their own path.
// Correctness no longer rests on this: a render that cannot resolve its param stalls instead
// of being stored (see stallNotFoundOutsidePrerender), so an uncovered article can no longer
// inherit the shared /articles/[slug] entry. This is now purely about serving articles 1..N
// from the CDN with no function invocation.
export async function generateStaticParams() {
  const articles = await getPublishedArticles();
  return articles.length > 0 ? articles.map((article) => ({ slug: String(article.number) })) : PLACEHOLDER_PARAMS;
}

// Numeric params are canonical. Legacy transliterated slugs are turned into a real 308 by
// the proxy (src/proxy.ts, matcher "/articles/:slug") before they ever reach this route, so
// anything non-numeric that survives to here is genuinely unresolvable.
async function resolveArticle(slugParam: string) {
  const number = parseArticleNumber(slugParam);
  if (number === null) {
    return null;
  }
  return getArticleByNumber(number);
}


// Not marked "use cache": the params promise is not a stable cache key, and metadata
// is part of the shell. resolveArticle() delegates to already-cached DAL functions
// keyed on the number or slug, which is where the caching belongs.
export async function generateMetadata({
  params,
}: PageProps<"/articles/[slug]">): Promise<Metadata> {
  const { slug } = await params;

  const article = await resolveArticle(slug);
  if (!article) {
    // Must pair with the guard in ArticleContent: metadata is baked into the same shared
    // entry as the body, so patching only one leaves every uncovered article a noindex head.
    await stallNotFoundOutsidePrerender();
    // notFound() streams with a 200 status, so Next never adds noindex itself.
    return { title: "הכתבה לא נמצאה", robots: { index: false } };
  }
  const articleUrl = `${SITE_URL}/articles/${article.number}`;
  const ogImage = article.coverImageUrl ?? "/og-wide.jpg";
  return {
    title: article.title,
    description: article.subtitle ?? undefined,
    alternates: { canonical: articleUrl, types: FEED_ALTERNATE },
    openGraph: {
      title: article.title,
      description: article.subtitle ?? undefined,
      type: "article",
      url: articleUrl,
      siteName: "כמה נגמר?",
      locale: "he_IL",
      images: [{ url: ogImage }],
      publishedTime: article.publishedAt?.toISOString(),
      modifiedTime: article.updatedAt.toISOString(),
      authors: [article.authorName],
      section: article.subject?.name,
      tags: article.tagList.map((tag) => tag.name),
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.subtitle ?? undefined,
      images: [ogImage],
    },
  };
}

function ArticleSkeleton() {
  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-10">
      <div className="flex animate-pulse flex-col gap-6" aria-hidden="true">
        <div className="h-10 w-3/4 rounded-lg bg-surface" />
        <div className="h-5 w-1/2 rounded-lg bg-surface" />
        <div className="aspect-video w-full rounded-2xl bg-surface" />
        <div className="h-32 w-full rounded-lg bg-surface" />
      </div>
    </main>
  );
}

// The label above the headline, linking to the subject's page.
function Kicker({ article }: { readonly article: ArticleDetail }) {
  const label = <SubjectKicker subject={article.subject} format={article.format} className="text-xs" />;
  if (!article.subject) return label;
  return (
    <Link href={subjectPath(article.subject.slug)} className="self-start transition-opacity hover:opacity-85">
      {label}
    </Link>
  );
}

function Headline({ article, className = "" }: { readonly article: ArticleDetail; readonly className?: string }) {
  return (
    <h1 className={`font-black leading-[1.1] tracking-tight text-balance ${className}`}>{article.title}</h1>
  );
}

function Byline({ article }: { readonly article: ArticleDetail }) {
  const articleUrl = `${SITE_URL}/articles/${article.number}`;
  const wasUpdated =
    article.publishedAt !== null &&
    article.updatedAt.getTime() - article.publishedAt.getTime() > UPDATED_LABEL_THRESHOLD_MS;
  return (
    <div className="flex flex-wrap items-center gap-3 border-y border-surface-border py-3.5 text-sm text-text-muted">
      <AuthorAvatar name={article.authorName} size={34} />
      <span className="flex flex-col leading-snug">
        <span className="text-[0.85rem] font-bold text-white">{article.authorName}</span>
        <span className="text-xs">
          {article.publishedAt ? `${formatDateLong(article.publishedAt)} · ` : ""}
          {readingTimeLabel(article.content)}
          {wasUpdated ? ` · עודכן: ${formatDateLong(article.updatedAt)}` : ""}
        </span>
      </span>
      <span className="ms-auto">
        <ShareButton title={article.title} url={articleUrl} articleNumber={article.number} />
      </span>
    </div>
  );
}

// The article's tags grouped by the subject they belong to, then a door to
// every other subject the article appears in.
function TagsBySubject({ article }: { readonly article: ArticleDetail }) {
  const groups = article.subjects
    .map((subject) => ({ subject, tags: article.tagList.filter((tag) => tag.subjectId === subject.id) }))
    .filter((group) => group.tags.length > 0);
  // Tags the admin hasn't sorted into a subject yet: shown, but with no page to open.
  const unsorted = article.tagList.filter((tag) => tag.subjectId === null);
  if (groups.length === 0 && unsorted.length === 0 && article.alsoIn.length === 0) return null;

  return (
    <div className="flex flex-col gap-4 border-t border-surface-border pt-5">
      {groups.map(({ subject, tags }) => (
        <div key={subject.id} style={subjectStyle(subject.color)} className="flex flex-wrap items-center gap-2 text-sm">
          <span className="flex min-w-28 items-center gap-2 text-text-muted">
            <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[var(--subject)]" />
            {subject.name}
          </span>
          {tags.map((tag) => (
            <Link
              key={tag.id}
              href={`${subjectPath(subject.slug)}?tag=${encodeURIComponent(tag.name)}`}
              className="rounded-full border border-[var(--subject)]/45 px-3 py-1 text-xs transition-colors hover:bg-[var(--subject)]/15"
            >
              {tag.name}
            </Link>
          ))}
        </div>
      ))}
      {unsorted.length > 0 ? (
        <div className="flex flex-wrap gap-2 text-xs text-text-muted">
          {unsorted.map((tag) => (
            <span key={tag.id} className="rounded-full border border-surface-border px-3 py-1">
              {tag.name}
            </span>
          ))}
        </div>
      ) : null}
      {article.alsoIn.map((subject) => (
        <Link
          key={subject.id}
          href={subjectPath(subject.slug)}
          style={subjectStyle(subject.color)}
          className="flex items-center gap-2.5 rounded-xl border border-[var(--subject)]/35 bg-[var(--subject)]/[0.08] px-4 py-3 text-sm transition-colors hover:bg-[var(--subject)]/15"
        >
          <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-[var(--subject)]" />
          הכתבה מופיעה גם ב<b className="text-[var(--subject)]">{subject.name}</b>
          <span className="ms-auto font-bold text-[var(--subject)]">לנושא</span>
        </Link>
      ))}
    </div>
  );
}

// Full-bleed cover with the headline on the photo; the article rides up over
// it on a sheet with rounded top corners. The headline and credit sit just
// above the sheet's overlap.
function CoverLayout({ article, children }: { readonly article: ArticleDetail; readonly children: ReactNode }) {
  const cover = (
    <figure className="sticky top-0 m-0 h-[68svh] min-h-[26rem] overflow-hidden bg-bg-start md:h-[72vh]">
      <Image
        src={article.coverImageUrl ?? ""}
        alt=""
        fill
        sizes="100vw"
        loading="eager"
        fetchPriority="high"
        style={{ objectPosition: coverPosition(article) }}
        className="cover-photo object-cover"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(to_top,rgba(6,13,24,0.94)_0%,rgba(6,13,24,0.45)_34%,transparent_62%)]"
      />
      <div className="cover-headline absolute inset-x-0 bottom-[calc(var(--sheet-overlap)+1.25rem)] md:bottom-[calc(var(--sheet-overlap)+2rem)]">
        <div className="mx-auto flex max-w-[47.5rem] flex-col gap-3 px-6 md:px-12">
          <Kicker article={article} />
          <Headline article={article} className="text-[clamp(1.9rem,1.3rem+3.2vw,3.25rem)] [text-shadow:0_2px_18px_rgba(0,0,0,0.45)]" />
        </div>
      </div>
      {article.coverCredit ? (
        <figcaption className="absolute end-4 bottom-[calc(var(--sheet-overlap)+0.5rem)] text-[0.72rem] text-white/80 [text-shadow:0_1px_6px_rgba(0,0,0,0.75)] md:bottom-[calc(var(--sheet-overlap)+0.75rem)]">
          {article.coverCredit}
        </figcaption>
      ) : null}
    </figure>
  );
  return (
    <CoverSheet
      cover={cover}
      overlapClassName="[--sheet-overlap:1.875rem] md:[--sheet-overlap:7.5rem]"
      sheetAs="article"
      sheetClassName="flex flex-col gap-6 px-6 pt-6 pb-12 md:mx-auto md:max-w-[47.5rem] md:px-12 md:pt-10"
    >
      {article.subtitle ? (
        <p className="text-xl leading-relaxed font-light text-white/75">{article.subtitle}</p>
      ) : null}
      {children}
    </CoverSheet>
  );
}

// Articles without a cover keep the classic column.
function PlainLayout({ article, children }: { readonly article: ArticleDetail; readonly children: ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-10">
      <article className="flex flex-col gap-6">
        <header className="flex flex-col gap-4">
          <Kicker article={article} />
          <Headline article={article} className="text-[clamp(2rem,1.4rem+3vw,3.2rem)]" />
          {article.subtitle ? (
            <p className="text-xl leading-relaxed font-light text-white/70">{article.subtitle}</p>
          ) : null}
        </header>
        {children}
      </article>
    </main>
  );
}

async function ArticleContent({
  params,
}: {
  readonly params: PageProps<"/articles/[slug]">["params"];
}) {
  const { slug } = await params;
  const article = await resolveArticle(slug);
  if (!article) {
    await stallNotFoundOutsidePrerender();
    notFound();
  }
  const [plan, linkedPoll] = await Promise.all([
    getRecirculation(article.number),
    article.pollId ? getPollById(article.pollId) : Promise.resolve(null),
  ]);
  // A linked poll renders mid-article (the high-engagement zone just below the
  // fold); the generic main poll stays at the bottom. Never both.
  const midPoll = linkedPoll?.status === "active" ? linkedPoll : null;
  const shouldSplitBlocks = plan.midArticle.length > 0 || midPoll !== null;
  const subjectCrumb = article.subject
    ? { name: article.subject.name, url: `${SITE_URL}${subjectPath(article.subject.slug)}` }
    : { name: "כתבות", url: `${SITE_URL}/articles` };
  const Layout = article.coverImageUrl ? CoverLayout : PlainLayout;

  return (
    <Layout article={article}>
      <JsonLd
        data={newsArticleSchema(article, {
          section: article.subject?.name,
          keywords: article.tagList.map((tag) => tag.name),
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: "בית", url: SITE_URL },
          subjectCrumb,
          { name: article.title, url: `${SITE_URL}/articles/${article.number}` },
        ])}
      />
      <Byline article={article} />
      {article.episodeUrl ? <EpisodeCallout url={article.episodeUrl} /> : null}
      {shouldSplitBlocks ? (
        <>
          <BlockRenderer blocks={article.content.slice(0, MID_MODULE_AFTER_BLOCKS)} emphasizeOpener />
          {midPoll ? <PollSection poll={midPoll} placement="article-mid" /> : null}
          {plan.midArticle.length > 0 ? <MidArticleRelated articles={plan.midArticle} subject={article.subject} /> : null}
          <BlockRenderer blocks={article.content.slice(MID_MODULE_AFTER_BLOCKS)} />
        </>
      ) : (
        <BlockRenderer blocks={article.content} emphasizeOpener />
      )}
      <TagsBySubject article={article} />
      {midPoll ? null : <PollSection placement="article-bottom" />}
      <RecirculationSections plan={plan} subject={article.subject} />
      <ViewTracker articleNumber={article.number} />
    </Layout>
  );
}

export default function ArticlePage({ params }: PageProps<"/articles/[slug]">) {
  return (
    <Suspense fallback={<ArticleSkeleton />}>
      <ArticleContent params={params} />
    </Suspense>
  );
}
