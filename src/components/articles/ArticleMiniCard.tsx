import Link from "next/link";
import type { ArticleView } from "@/lib/dal/articles";
import { CoverImage, subjectStyle } from "./subject";

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
        <CoverImage
          article={article}
          sizes="96px"
          className="transition-transform duration-300 group-hover:scale-[1.05]"
          labelClassName="text-[0.6rem]"
        />
      </div>
      <h3 className="line-clamp-2 text-sm font-bold leading-snug transition-colors group-hover:text-[var(--subject)]">
        {article.title}
      </h3>
    </Link>
  );
}
