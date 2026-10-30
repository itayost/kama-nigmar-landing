import Link from "next/link";
import type { ArticleView } from "@/lib/dal/articles";
import { formatDateShort } from "@/lib/datetime";
import { AlsoIn, CoverImage, subjectStyle, SubjectKicker } from "./subject";

interface ArticleRowProps {
  readonly article: ArticleView;
  // Shown under the title instead of the date, e.g. the tag that brought a
  // roundup into a subject's list.
  readonly note?: string;
  readonly showSubtitle?: boolean;
  // A tag to name after the date, e.g. the subject's own tag on its page.
  readonly tagName?: string;
  readonly className?: string;
  readonly phEvent?: string;
}

// A thumbnail and a headline: the dense list item of sections and subject pages.
export function ArticleRow({ article, note, showSubtitle, tagName, phEvent, className = "" }: ArticleRowProps) {
  return (
    <Link
      href={`/articles/${article.number}`}
      data-ph-event={phEvent}
      data-ph-slug={article.number}
      style={subjectStyle(article.subject?.color)}
      className={`group grid grid-cols-[6rem_minmax(0,1fr)] items-start gap-3 border-b border-surface-border py-3 last:border-b-0 sm:grid-cols-[8.5rem_minmax(0,1fr)] sm:gap-4 ${className}`}
    >
      <div className="relative aspect-[3/2] overflow-hidden rounded-lg bg-surface">
        <CoverImage
          article={article}
          sizes="(max-width: 640px) 96px, 136px"
          className="transition-transform duration-300 group-hover:scale-[1.04] motion-reduce:transform-none"
          labelClassName="text-[0.65rem]"
        />
      </div>
      <div className="flex min-w-0 flex-col gap-1">
        <h3 className="text-[0.95rem] font-bold leading-snug text-pretty transition-colors group-hover:text-[var(--subject)]">
          {article.title}
        </h3>
        {showSubtitle && article.subtitle ? (
          <p className="line-clamp-2 text-sm text-text-muted">{article.subtitle}</p>
        ) : null}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-text-muted">
          {article.subject ? null : <SubjectKicker subject={null} format={article.format} />}
          {note ?? (article.publishedAt ? formatDateShort(article.publishedAt) : null)}
          {tagName && !note ? <span>· {tagName}</span> : null}
          <AlsoIn subject={article.subject} alsoIn={article.alsoIn} />
        </div>
      </div>
    </Link>
  );
}
