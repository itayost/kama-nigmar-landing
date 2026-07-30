import Link from "next/link";
import { Divider } from "@/components/ui/Divider";
import { getLatestArticles } from "@/lib/dal/articles";
import { ArticleCard } from "./ArticleCard";

export async function LatestArticlesSection() {
  const articles = await getLatestArticles(4);
  if (articles.length === 0) return null;

  return (
    <>
      <Divider />
      <section aria-labelledby="latest-articles-heading" className="w-full">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="latest-articles-heading" className="text-lg font-bold text-white">
            כתבות אחרונות
          </h2>
          <Link
            href="/articles"
            className="text-sm text-accent transition-opacity hover:opacity-80"
          >
            לכל הכתבות
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </section>
    </>
  );
}
