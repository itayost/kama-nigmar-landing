import type { Article } from "@/lib/db/schema";
import { ArticleCard } from "./ArticleCard";

interface ArticlesGridProps {
  readonly articles: readonly Article[];
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
