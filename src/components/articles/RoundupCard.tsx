import Link from "next/link";
import { ForwardArrow } from "@/components/ui/ForwardArrow";
import { minutesLabel } from "@/lib/articles/reading-time";
import { splitShowQuestion } from "@/lib/articles/title";
import type { ArticleView } from "@/lib/dal/articles";
import { formatDateShort, formatWeekday } from "@/lib/datetime";
import { CoverImage, subjectStyle } from "./subject";

interface RoundupCardProps {
  readonly article: ArticleView;
  // h2 on the roundups page, where the cards sit directly under its h1.
  readonly as?: "h2" | "h3";
}

// A roundup is a piece to open and read: its cover with the day it went out,
// its title, and the subjects it covers, so a basketball fan can see there is
// basketball in this week's summary. The footer says it opens, in white, the
// site's color for reading (green is for listening). Cards fill their cell,
// so a row of them is one height however many subjects each lists. The focus
// ring sits just inside the edge, so the homepage's scrolling strip can't
// clip it.
export function RoundupCard({ article, as: Heading = "h3" }: RoundupCardProps) {
  // "כמה נגמר ?" opens many titles; on the site's own pages it says nothing.
  const title = splitShowQuestion(article.title) ?? article.title;
  // Named by its title and the cue, as the homepage cover is; the date and
  // subjects stay readable inside it.
  const id = `roundup-${article.id}`;
  return (
    <Link
      href={`/articles/${article.number}`}
      aria-labelledby={`${id}-title ${id}-cue`}
      data-ph-event="home_roundup_click"
      data-ph-slug={article.number}
      className="group flex h-full min-w-0 flex-col overflow-hidden rounded-[14px] border border-surface-border bg-white/[0.04] transition-colors [--focus-offset:-2px] hover:border-white/25"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-surface lg:aspect-video">
        <CoverImage
          article={article}
          sizes="(max-width: 639px) 80vw, (max-width: 1023px) 45vw, 320px"
          className="transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transform-none"
          labelClassName="text-2xl"
        />
        {article.publishedAt ? (
          <time
            dateTime={article.publishedAt.toISOString()}
            className="absolute start-2.5 bottom-2.5 rounded-full bg-[rgb(6_13_24/0.84)] px-2.5 py-1 text-xs leading-4 font-bold tabular-nums shadow-[0_4px_12px_-4px_rgb(0_0_0/0.6)]"
          >
            {formatWeekday(article.publishedAt)} · {formatDateShort(article.publishedAt)}
          </time>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col px-3.5 pt-3 pb-3.5 lg:px-4.5 lg:pt-3.5 lg:pb-4.5">
        <Heading id={`${id}-title`} className="line-clamp-2 leading-snug font-extrabold decoration-white/50 decoration-2 underline-offset-4 group-hover:underline lg:text-lg">
          {title}
        </Heading>
        <p className="mt-0.5 text-[0.8rem] font-semibold text-text-muted">{minutesLabel(article.readingMinutes)}</p>
        {article.subjects.length > 0 ? (
          <ul aria-label="נושאים בסיכום" className="mt-auto flex flex-wrap gap-x-2.5 gap-y-0.5 pt-3 text-xs leading-[1.4] text-text-muted">
            {article.subjects.map((subject) => (
              <li key={subject.id} className="flex items-center gap-1.5 whitespace-nowrap">
                <span aria-hidden="true" style={subjectStyle(subject.color)} className="h-2 w-2 rounded-full bg-[var(--subject)]" />
                {subject.name}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <span className="flex items-center justify-between gap-2.5 border-t border-surface-border py-2.5 ps-3.5 pe-3 text-sm font-extrabold lg:ps-4.5">
        <span id={`${id}-cue`}>לקריאת הסיכום</span>
        <span className="grid h-7.5 w-7.5 shrink-0 place-items-center rounded-full bg-white text-bg-start shadow-[0_6px_16px_-8px_rgb(0_0_0/0.7)] transition-colors group-active:bg-[#e3e8ef]">
          <ForwardArrow className="h-4 w-4" />
        </span>
      </span>
    </Link>
  );
}
