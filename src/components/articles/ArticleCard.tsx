import Image from "next/image";
import Link from "next/link";
import { formatDateLong } from "@/lib/datetime";
import type { Article } from "@/lib/db/schema";

interface ArticleCardProps {
  readonly article: Article;
  readonly phEvent?: string;
}

export function ArticleCard({ article, phEvent }: ArticleCardProps) {
  return (
    <Link
      href={`/articles/${article.slug}`}
      data-ph-event={phEvent}
      data-ph-slug={article.slug}
      className="group flex flex-col overflow-hidden rounded-xl border border-surface-border bg-surface transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-[0_0_30px_rgba(46,204,64,0.12)] active:scale-[0.98] motion-reduce:transform-none"
    >
      <div className="relative aspect-video w-full overflow-hidden">
        {article.coverImageUrl ? (
          <Image
            src={article.coverImageUrl}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transform-none"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-bg-start to-bg-end">
            <span className="text-xl font-extrabold text-accent/40">כמה נגמר?</span>
          </div>
        )}
        {article.tags[0] ? (
          <span className="absolute start-2.5 top-2.5 rounded-md bg-accent px-2 py-0.5 text-[0.7rem] font-extrabold text-bg-start">
            {article.tags[0]}
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-bold leading-snug transition-colors group-hover:text-accent">
          {article.title}
        </h3>
        {article.subtitle ? (
          <p className="line-clamp-2 text-sm text-text-muted">{article.subtitle}</p>
        ) : null}
        <div className="mt-auto flex items-center gap-2 pt-2 text-xs text-text-muted">
          <span className="flex h-[20px] w-[20px] items-center justify-center rounded-full bg-accent/20 text-[0.65rem] font-extrabold text-accent">
            {article.authorName.charAt(0)}
          </span>
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
      </div>
    </Link>
  );
}
