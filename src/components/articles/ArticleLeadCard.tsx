import Image from "next/image";
import Link from "next/link";
import { readingTimeLabel } from "@/lib/articles/reading-time";
import { formatDateLong } from "@/lib/datetime";
import type { Article } from "@/lib/db/schema";

interface ArticleLeadCardProps {
  readonly article: Article;
}

// Magazine cover card: the headline sits ON the image under a bottom scrim.
export function ArticleLeadCard({ article }: ArticleLeadCardProps) {
  return (
    <Link
      href={`/articles/${article.slug}`}
      className="group relative block min-h-[340px] overflow-hidden rounded-[20px] border border-surface-border transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-[0_0_44px_rgba(46,204,64,0.14)] active:scale-[0.99] motion-reduce:transform-none md:min-h-[380px]"
    >
      <div className="absolute inset-0">
        {article.coverImageUrl ? (
          <Image
            src={article.coverImageUrl}
            alt=""
            fill
            sizes="(max-width: 1024px) 100vw, 972px"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02] motion-reduce:transform-none"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(80%_100%_at_70%_20%,rgba(46,204,64,0.15),transparent_55%),linear-gradient(150deg,#14311f_0%,#0d1d33_60%,#101a3a_100%)]">
            <span className="text-5xl font-black text-white/5">כמה נגמר?</span>
          </div>
        )}
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(to_top,rgba(6,13,24,0.96)_0%,rgba(6,13,24,0.55)_45%,transparent_75%)]"
      />
      <div className="absolute inset-x-0 bottom-0 p-6 md:p-7">
        {article.tags[0] ? (
          <span className="mb-3 inline-block rounded-md bg-accent px-2.5 py-0.5 text-xs font-extrabold text-bg-start">
            {article.tags[0]}
          </span>
        ) : null}
        <h3 className="mb-2 max-w-[22ch] text-[clamp(1.6rem,1.2rem+2.2vw,2.5rem)] font-black leading-[1.12] text-balance">
          {article.title}
        </h3>
        {article.subtitle ? (
          <p className="mb-3 max-w-[52ch] text-white/75">{article.subtitle}</p>
        ) : null}
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-accent/20 text-[0.7rem] font-extrabold text-accent">
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
          <span>·</span>
          <span>{readingTimeLabel(article.content)}</span>
        </div>
      </div>
    </Link>
  );
}
