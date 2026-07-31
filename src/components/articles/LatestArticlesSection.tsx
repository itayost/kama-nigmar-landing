import { SectionHeading } from "@/components/ui/SectionHeading";
import { getLatestArticles } from "@/lib/dal/articles";
import { ArticleCard } from "./ArticleCard";
import { ArticleLeadCard } from "./ArticleLeadCard";

export async function LatestArticlesSection() {
  const articles = await getLatestArticles(4);
  if (articles.length === 0) return null;

  const [lead, ...rest] = articles;

  return (
    <section aria-labelledby="latest-articles-heading" className="w-full">
      <SectionHeading
        title="הסיפור הגדול"
        id="latest-articles-heading"
        linkHref="/articles"
        linkLabel="לכל הכתבות"
      />
      <ArticleLeadCard article={lead} />
      {rest.length > 0 ? (
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : null}
    </section>
  );
}
