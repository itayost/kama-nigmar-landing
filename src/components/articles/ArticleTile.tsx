import Link from "next/link";
import type { ArticleView } from "@/lib/dal/articles";
import { formatDateShort } from "@/lib/datetime";
import { AlsoIn, CoverImage, kickerLabel, subjectStyle, SubjectKicker } from "./subject";

interface ArticleTileProps {
  readonly article: ArticleView;
  readonly phEvent: string;
  // The rendered image width at each size.
  readonly sizes: string;
  readonly showKicker?: boolean;
}

// One link that is a compact row on a phone and a card from the small
// breakpoint up, so a list never carries the same article twice.
export function ArticleTile({ article, phEvent, sizes, showKicker = true }: ArticleTileProps) {
  return (
    <Link
      href={`/articles/${article.number}`}
      data-ph-event={phEvent}
      data-ph-slug={article.number}
      style={subjectStyle(article.subject?.color)}
      className="group grid grid-cols-[6rem_minmax(0,1fr)] items-start gap-3 border-b border-surface-border py-3 last:border-b-0 sm:flex sm:flex-col sm:items-stretch sm:gap-0 sm:overflow-hidden sm:rounded-xl sm:border sm:bg-surface sm:py-0 sm:transition-colors sm:last:border-b sm:hover:border-[var(--subject)]/45"
    >
      <div className="relative aspect-[3/2] overflow-hidden rounded-lg bg-surface sm:aspect-video sm:rounded-none">
        <CoverImage
          article={article}
          sizes={sizes}
          className="transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transform-none"
          labelClassName="text-[0.7rem] sm:text-xl"
        />
        {showKicker ? (
          <span className="absolute start-2.5 top-2.5 hidden sm:block">
            <SubjectKicker subject={article.subject} format={article.format} />
          </span>
        ) : null}
      </div>
      <div className="flex min-w-0 flex-col gap-1 sm:flex-1 sm:gap-2 sm:p-4">
        <h3 className="text-[0.95rem] font-bold leading-snug text-pretty transition-colors group-hover:text-[var(--subject)] sm:text-base">
          {article.title}
        </h3>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-text-muted">
          {/* On a phone the label sits here; from sm up it is on the image. */}
          {showKicker && kickerLabel(article.subject, article.format) ? (
            <span className="sm:hidden">
              <SubjectKicker subject={article.subject} format={article.format} />
            </span>
          ) : null}
          {article.publishedAt ? formatDateShort(article.publishedAt) : null}
          <AlsoIn subject={article.subject} alsoIn={article.alsoIn} />
        </div>
      </div>
    </Link>
  );
}
