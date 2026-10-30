import type { ArticleView } from "@/lib/dal/articles";
import { ArticleCard } from "./ArticleCard";

interface ArticlesGridProps {
  readonly articles: readonly ArticleView[];
}

export function ArticlesGrid({ articles }: ArticlesGridProps) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
}
