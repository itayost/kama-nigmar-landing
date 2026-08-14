import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { BlockRenderer } from "@/components/articles/BlockRenderer";
import { EpisodeCallout } from "@/components/articles/EpisodeCallout";
import { MidArticleRelated } from "@/components/articles/MidArticleRelated";
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
} from "@/lib/dal/articles";
import { formatDateLong } from "@/lib/datetime";
import { FEED_ALTERNATE, breadcrumbSchema, newsArticleSchema } from "@/lib/seo/schema";
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
  return articles.map((article) => ({ slug: String(article.number) }));
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

// A "not found" outcome must never be prerenderable, and it is the only outcome that needs
// the guard. A render with a concrete param is keyed on its own path (/articles/7), but a
// render with unresolved fallback params is keyed on the shared /articles/[slug] entry and
// degrades the param to a placeholder - which parseArticleNumber rejects, so it always lands
// here. Without stalling, that complete not-found page is stored under the shared key and
// replayed at a 200 for every param generateStaticParams did not cover: every article
// published since the last deploy, served a not-found body and a noindex head. The shared
// entry deliberately carries none of the path or "articles" cache tags, so neither
// updateTag nor revalidatePath can clear it afterwards.
//
// Under a real request connection() resolves immediately, so genuine 404s are unaffected,
// and articles keep rendering as fully static per-path entries.
async function stallNotFoundOutsidePrerender(): Promise<void> {
  await connection();
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
      section: article.tags[0],
      tags: article.tags,
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
    <div className="flex animate-pulse flex-col gap-6" aria-hidden="true">
      <div className="h-10 w-3/4 rounded-lg bg-surface" />
      <div className="h-5 w-1/2 rounded-lg bg-surface" />
      <div className="aspect-video w-full rounded-2xl bg-surface" />
      <div className="h-32 w-full rounded-lg bg-surface" />
    </div>
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
  const articleUrl = `${SITE_URL}/articles/${article.number}`;
  const wasUpdated =
    article.publishedAt !== null &&
    article.updatedAt.getTime() - article.publishedAt.getTime() >
      UPDATED_LABEL_THRESHOLD_MS;

  const crumbTitle =
    article.title.length > 40 ? `${article.title.slice(0, 40)}…` : article.title;

  return (
    <article className="flex flex-col gap-6">
      <JsonLd data={newsArticleSchema(article)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "בית", url: SITE_URL },
          { name: "כתבות", url: `${SITE_URL}/articles` },
          { name: article.title, url: `${SITE_URL}/articles/${article.number}` },
        ])}
      />
      <header className="flex flex-col gap-4">
        <nav aria-label="פירורי לחם" className="flex flex-wrap gap-1.5 text-xs text-text-muted">
          <Link href="/" className="transition-colors hover:text-white">
            בית
          </Link>
          <span aria-hidden="true">‹</span>
          <Link href="/articles" className="transition-colors hover:text-white">
            כתבות
          </Link>
          <span aria-hidden="true">‹</span>
          <span>{crumbTitle}</span>
        </nav>
        {article.tags[0] ? (
          <Link
            href={`/articles?tag=${encodeURIComponent(article.tags[0])}`}
            className="self-start rounded-md bg-accent px-2.5 py-0.5 text-xs font-extrabold text-bg-start transition-opacity hover:opacity-85"
          >
            {article.tags[0]}
          </Link>
        ) : null}
        <h1 className="text-[clamp(2rem,1.4rem+3vw,3.2rem)] font-black leading-[1.12] tracking-tight text-balance">
          {article.title}
        </h1>
        {article.subtitle ? (
          <p className="text-xl font-light leading-relaxed text-white/70">
            {article.subtitle}
          </p>
        ) : null}
        <div className="flex flex-wrap items-center gap-3 border-y border-surface-border py-3.5 text-sm text-text-muted">
          <span className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-accent/20 font-extrabold text-accent">
            {article.authorName.charAt(0)}
          </span>
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
        {article.coverImageUrl ? (
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-surface-border">
            <Image
              src={article.coverImageUrl}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 672px"
              loading="eager"
              fetchPriority="high"
              className="object-cover"
            />
          </div>
        ) : null}
      </header>
      {article.episodeUrl ? <EpisodeCallout url={article.episodeUrl} /> : null}
      {shouldSplitBlocks ? (
        <>
          <BlockRenderer
            blocks={article.content.slice(0, MID_MODULE_AFTER_BLOCKS)}
            emphasizeOpener
          />
          {midPoll ? <PollSection poll={midPoll} placement="article-mid" /> : null}
          {plan.midArticle.length > 0 ? (
            <MidArticleRelated articles={plan.midArticle} />
          ) : null}
          <BlockRenderer blocks={article.content.slice(MID_MODULE_AFTER_BLOCKS)} />
        </>
      ) : (
        <BlockRenderer blocks={article.content} emphasizeOpener />
      )}
      {article.tags.length > 1 ? (
        <div className="flex flex-wrap gap-2 border-t border-surface-border pt-5">
          {article.tags.map((tag) => (
            <Link
              key={tag}
              href={`/articles?tag=${encodeURIComponent(tag)}`}
              className="rounded-full border border-surface-border px-3 py-1 text-xs text-text-muted transition-colors hover:border-accent/50 hover:text-white"
            >
              {tag}
            </Link>
          ))}
        </div>
      ) : null}
      {midPoll ? null : <PollSection placement="article-bottom" />}
      <RecirculationSections plan={plan} />
      <ViewTracker articleNumber={article.number} />
    </article>
  );
}

export default function ArticlePage({ params }: PageProps<"/articles/[slug]">) {
  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-10">
      <Suspense fallback={<ArticleSkeleton />}>
        <ArticleContent params={params} />
      </Suspense>
      <footer className="mt-12 border-t border-surface-border pt-6">
        <Link
          href="/articles"
          className="text-sm text-accent transition-opacity hover:opacity-80"
        >
          חזרה לכל הכתבות
        </Link>
      </footer>
    </main>
  );
}
