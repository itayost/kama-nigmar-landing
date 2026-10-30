import Link from "next/link";
import type { ArticleView } from "@/lib/dal/articles";
import { formatDateShort } from "@/lib/datetime";
import { CoverImage, subjectStyle } from "./subject";

interface RoundupCardProps {
  readonly article: ArticleView;
  // h2 on the roundups page, where the cards sit directly under its h1.
  readonly as?: "h2" | "h3";
}

// A roundup leads with its date and lists the subjects it covers, so a
// basketball fan can see there is basketball in this week's summary.
export function RoundupCard({ article, as: Heading = "h3" }: RoundupCardProps) {
  return (
    <Link
      href={`/articles/${article.number}`}
      data-ph-event="home_roundup_click"
      data-ph-slug={article.number}
      className="group grid min-w-0 grid-cols-[5.5rem_minmax(0,1fr)] items-start gap-3 rounded-xl border border-surface-border bg-white/[0.035] p-3.5 transition-colors hover:border-white/25"
    >
      <div className="relative aspect-square overflow-hidden rounded-lg bg-surface">
        <CoverImage article={article} sizes="88px" labelClassName="text-[0.6rem]" />
      </div>
      <div className="flex min-w-0 flex-col gap-1">
        {article.publishedAt ? (
          <time
            dateTime={article.publishedAt.toISOString()}
            className="text-lg font-black leading-none tabular-nums tracking-tight"
          >
            {formatDateShort(article.publishedAt)}
          </time>
        ) : null}
        <Heading className="line-clamp-2 text-sm font-medium text-white/80 transition-colors group-hover:text-white">
          {article.title}
        </Heading>
        {article.subjects.length > 0 ? (
          <ul aria-label="נושאים בסיכום" className="mt-1 flex flex-wrap gap-x-2.5 gap-y-1 text-xs text-text-muted">
            {article.subjects.map((subject) => (
              <li key={subject.id} className="flex items-center gap-1.5 whitespace-nowrap">
                <span aria-hidden="true" style={subjectStyle(subject.color)} className="h-2 w-2 rounded-full bg-[var(--subject)]" />
                {subject.name}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </Link>
  );
}
