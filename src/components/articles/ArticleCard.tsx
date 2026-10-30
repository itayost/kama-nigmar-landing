import Link from "next/link";
import { AuthorAvatar } from "@/components/articles/AuthorAvatar";
import { formatDateLong } from "@/lib/datetime";
import type { ArticleView } from "@/lib/dal/articles";
import { AlsoIn, CoverImage, subjectStyle, SubjectKicker } from "./subject";

interface ArticleCardProps {
  readonly article: ArticleView;
  readonly phEvent?: string;
  // The rendered width, for the cover image; defaults to the three-column grid.
  readonly sizes?: string;
}

export function ArticleCard({
  article,
  phEvent,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px",
}: ArticleCardProps) {
  return (
    <Link
      href={`/articles/${article.number}`}
      data-ph-event={phEvent}
      data-ph-slug={article.number}
      style={subjectStyle(article.subject?.color)}
      className="group flex flex-col overflow-hidden rounded-xl border border-surface-border bg-surface transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--subject)]/45 active:scale-[0.98] motion-reduce:transform-none"
    >
      <div className="relative aspect-video w-full overflow-hidden">
        <CoverImage
          article={article}
          sizes={sizes}
          className="transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transform-none"
          labelClassName="text-xl"
        />
        <SubjectKicker subject={article.subject} format={article.format} className="absolute start-2.5 top-2.5" />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-bold leading-snug text-balance transition-colors group-hover:text-[var(--subject)]">
          {article.title}
        </h3>
        {article.subtitle ? (
          <p className="line-clamp-2 text-sm text-text-muted">{article.subtitle}</p>
        ) : null}
        <div className="mt-auto flex items-center gap-2 pt-2 text-xs text-text-muted">
          <AuthorAvatar name={article.authorName} size={20} />
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
        <AlsoIn subject={article.subject} alsoIn={article.alsoIn} />
      </div>
    </Link>
  );
}
