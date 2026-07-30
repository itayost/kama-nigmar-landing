import Image from "next/image";
import Link from "next/link";
import { formatDateLong } from "@/lib/datetime";
import type { Article } from "@/lib/db/schema";

interface ArticleLeadCardProps {
  readonly article: Article;
}

export function ArticleLeadCard({ article }: ArticleLeadCardProps) {
  return (
    <Link
      href={`/articles/${article.slug}`}
      className="group grid overflow-hidden rounded-2xl border border-surface-border bg-surface transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-[0_0_40px_rgba(46,204,64,0.12)] md:grid-cols-[1.1fr_1fr]"
    >
      <div className="relative min-h-[200px] overflow-hidden md:min-h-[240px]">
        {article.coverImageUrl ? (
          <Image
            src={article.coverImageUrl}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 55vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-bg-start to-bg-end">
            <span className="text-3xl font-extrabold text-accent/40">כמה נגמר?</span>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2.5 p-6 md:p-7">
        {article.tags[0] ? (
          <span className="self-start rounded-full border border-accent/35 px-2.5 py-0.5 text-xs font-bold text-accent">
            {article.tags[0]}
          </span>
        ) : null}
        <h3 className="text-2xl font-extrabold leading-tight text-balance transition-colors group-hover:text-accent">
          {article.title}
        </h3>
        {article.subtitle ? (
          <p className="line-clamp-3 text-[0.95rem] text-text-muted">{article.subtitle}</p>
        ) : null}
        <div className="mt-auto flex items-center gap-2 pt-2 text-xs text-text-muted">
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
