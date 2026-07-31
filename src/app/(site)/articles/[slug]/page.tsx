import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cacheLife, cacheTag } from "next/cache";
import { Suspense } from "react";
import { BlockRenderer } from "@/components/articles/BlockRenderer";
import { RelatedArticles } from "@/components/articles/RelatedArticles";
import { ViewTracker } from "@/components/articles/ViewTracker";
import { JsonLd } from "@/components/seo/JsonLd";
import { getArticleBySlug } from "@/lib/dal/articles";
import { formatDateLong } from "@/lib/datetime";
import { FEED_ALTERNATE, breadcrumbSchema, newsArticleSchema } from "@/lib/seo/schema";
import { SITE_URL } from "@/lib/site";

export async function generateMetadata({
  params,
}: PageProps<"/articles/[slug]">): Promise<Metadata> {
  "use cache";
  const { slug } = await params;
  cacheLife("max");
  cacheTag("articles", `article-${slug}`);

  const article = await getArticleBySlug(slug);
  if (!article) {
    return { title: "הכתבה לא נמצאה" };
  }
  const articleUrl = `${SITE_URL}/articles/${article.slug}`;
  const ogImage = article.coverImageUrl ?? "/og-image.jpg";
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
  const article = await getArticleBySlug(slug);
  if (!article) {
    notFound();
  }

  return (
    <article className="flex flex-col gap-6">
      <JsonLd data={newsArticleSchema(article)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "בית", url: SITE_URL },
          { name: "כתבות", url: `${SITE_URL}/articles` },
          { name: article.title, url: `${SITE_URL}/articles/${article.slug}` },
        ])}
      />
      <header className="flex flex-col gap-4">
        {article.tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
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
        <h1 className="text-3xl font-extrabold leading-tight md:text-4xl">
          {article.title}
        </h1>
        {article.subtitle ? (
          <p className="text-lg leading-relaxed text-text-muted">{article.subtitle}</p>
        ) : null}
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <span>{article.authorName}</span>
          {article.publishedAt ? (
            <>
              <span>·</span>
              <time dateTime={article.publishedAt.toISOString()}>
                {formatDateLong(article.publishedAt)}
              </time>
            </>
          ) : null}
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
      <BlockRenderer blocks={article.content} />
      <RelatedArticles slug={article.slug} />
      <ViewTracker slug={article.slug} />
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
