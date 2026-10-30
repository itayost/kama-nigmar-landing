import type { ArticleView } from "@/lib/dal/articles";
import { ArticleTile } from "./ArticleTile";

interface ArticlesGridProps {
  readonly articles: readonly ArticleView[];
}

// The archive list: compact rows on a phone, like the subject page, and a
// card grid from the small breakpoint up.
export function ArticlesGrid({ articles }: ArticlesGridProps) {
  return (
    <div className="flex flex-col sm:grid sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
      {articles.map((article) => (
        <ArticleTile
          key={article.id}
          article={article}
          phEvent="archive_click"
          sizes="(max-width: 640px) 96px, (max-width: 1024px) 50vw, 320px"
        />
      ))}
    </div>
  );
}
