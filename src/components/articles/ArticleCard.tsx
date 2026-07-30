import Image from "next/image";
import Link from "next/link";
import { formatDateLong } from "@/lib/datetime";
import type { Article } from "@/lib/db/schema";

interface ArticleCardProps {
  readonly article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Link
      href={`/articles/${article.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-surface-border bg-surface transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-[0_0_30px_rgba(46,204,64,0.12)]"
    >
      <div className="relative aspect-video w-full overflow-hidden">
        {article.coverImageUrl ? (
          <Image
            src={article.coverImageUrl}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-bg-start to-bg-end">
            <span className="text-xl font-extrabold text-accent/40">כמה נגמר?</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-bold leading-snug transition-colors group-hover:text-accent">
          {article.title}
        </h3>
        {article.subtitle ? (
          <p className="line-clamp-2 text-sm text-text-muted">{article.subtitle}</p>
        ) : null}
        <div className="mt-auto flex items-center gap-2 pt-2 text-xs text-text-muted">
          {article.publishedAt ? (
            <time dateTime={article.publishedAt.toISOString()}>
              {formatDateLong(article.publishedAt)}
            </time>
          ) : null}
          <span>·</span>
          <span>{article.authorName}</span>
        </div>
      </div>
    </Link>
  );
}
