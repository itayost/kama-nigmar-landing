import Image from "next/image";
import Link from "next/link";
import type { ArticleView } from "@/lib/dal/articles";
import { formatDateShort } from "@/lib/datetime";
import { coverPosition } from "./subject";

interface RoundupCardProps {
  readonly article: ArticleView;
}

// A roundup leads with its date and lists the subjects it covers, so a
// basketball fan can see there is basketball in this week's summary.
export function RoundupCard({ article }: RoundupCardProps) {
  const covered = [...(article.subject ? [article.subject] : []), ...article.alsoIn];
  return (
    <Link
      href={`/articles/${article.number}`}
      data-ph-event="home_roundup_click"
      data-ph-slug={article.number}
      className="group grid min-w-0 grid-cols-[5.5rem_minmax(0,1fr)] items-start gap-3 rounded-xl border border-surface-border bg-white/[0.035] p-3.5 transition-colors hover:border-white/25"
    >
      <div className="relative aspect-square overflow-hidden rounded-lg bg-surface">
        {article.coverImageUrl ? (
          <Image
            src={article.coverImageUrl}
            alt=""
            fill
            sizes="88px"
            style={{ objectPosition: coverPosition(article) }}
            className="object-cover"
          />
        ) : null}
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
        <h3 className="line-clamp-2 text-sm font-medium text-white/80 transition-colors group-hover:text-white">
          {article.title}
        </h3>
        {covered.length > 0 ? (
          <ul aria-label="נושאים בסיכום" className="mt-1 flex flex-wrap gap-x-2.5 gap-y-1 text-xs text-text-muted">
            {covered.map((subject) => (
              <li key={subject.id} className="flex items-center gap-1.5 whitespace-nowrap">
                <span aria-hidden="true" className="h-2 w-2 rounded-full" style={{ backgroundColor: subject.color }} />
                {subject.name}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </Link>
  );
}
