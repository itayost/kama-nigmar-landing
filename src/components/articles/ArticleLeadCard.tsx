import Link from "next/link";
import { AuthorAvatar } from "@/components/articles/AuthorAvatar";
import { minutesLabel } from "@/lib/articles/reading-time";
import { formatDateLong } from "@/lib/datetime";
import type { ArticleView } from "@/lib/dal/articles";
import { CoverImage, subjectStyle, SubjectKicker } from "./subject";

interface ArticleLeadCardProps {
  readonly article: ArticleView;
}

// Magazine cover card: the headline sits ON the image under a bottom scrim.
export function ArticleLeadCard({ article }: ArticleLeadCardProps) {
  return (
    <Link
      href={`/articles/${article.number}`}
      style={subjectStyle(article.subject?.color)}
      className="group relative block min-h-[340px] overflow-hidden rounded-[20px] border border-surface-border transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--subject)]/45 active:scale-[0.99] motion-reduce:transform-none md:min-h-[380px]"
    >
      <div className="absolute inset-0">
        <CoverImage
          article={article}
          sizes="(max-width: 1024px) 100vw, 972px"
          className="transition-transform duration-300 group-hover:scale-[1.02] motion-reduce:transform-none"
          placeholderClassName="bg-[radial-gradient(80%_100%_at_70%_20%,rgba(46,204,64,0.15),transparent_55%),linear-gradient(150deg,#14311f_0%,#0d1d33_60%,#101a3a_100%)]"
          labelClassName="text-5xl font-black text-white/5"
        />
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(to_top,rgba(6,13,24,0.96)_0%,rgba(6,13,24,0.55)_45%,transparent_75%)]"
      />
      <div className="absolute inset-x-0 bottom-0 p-6 md:p-7">
        <SubjectKicker subject={article.subject} format={article.format} className="mb-3 text-xs" />
        <h3 className="mb-2 max-w-[22ch] text-[clamp(1.6rem,1.2rem+2.2vw,2.5rem)] font-black leading-[1.12] text-balance">
          {article.title}
        </h3>
        {article.subtitle ? (
          <p className="mb-3 max-w-[52ch] text-white/75">{article.subtitle}</p>
        ) : null}
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <AuthorAvatar name={article.authorName} size={22} />
          <span>{article.authorName}</span>
          {article.publishedAt ? (
            <>
              <span>·</span>
              <time dateTime={article.publishedAt.toISOString()}>
                {formatDateLong(article.publishedAt)}
              </time>
            </>
          ) : null}
          <span>·</span>
          <span>{minutesLabel(article.readingMinutes)}</span>
        </div>
      </div>
    </Link>
  );
}
