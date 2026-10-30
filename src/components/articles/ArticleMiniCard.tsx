import Image from "next/image";
import Link from "next/link";
import type { ArticleView } from "@/lib/dal/articles";
import { coverPosition, subjectStyle } from "./subject";

interface ArticleMiniCardProps {
  readonly article: ArticleView;
  readonly phEvent?: string;
}

export function ArticleMiniCard({ article, phEvent }: ArticleMiniCardProps) {
  return (
    <Link
      href={`/articles/${article.number}`}
      data-ph-event={phEvent}
      data-ph-slug={article.number}
      style={subjectStyle(article.subject?.color)}
      className="group flex items-center gap-3 rounded-xl border border-surface-border bg-surface p-2.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--subject)]/45"
    >
      <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg">
        {article.coverImageUrl ? (
          <Image
            src={article.coverImageUrl}
            alt=""
            fill
            sizes="96px"
            style={{ objectPosition: coverPosition(article) }}
            className="object-cover transition-transform duration-300 group-hover:scale-[1.05]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-bg-start to-bg-end">
            <span className="text-[0.6rem] font-extrabold text-accent/40">כמה נגמר?</span>
          </div>
        )}
      </div>
      <h3 className="line-clamp-2 text-sm font-bold leading-snug transition-colors group-hover:text-[var(--subject)]">
        {article.title}
      </h3>
    </Link>
  );
}
