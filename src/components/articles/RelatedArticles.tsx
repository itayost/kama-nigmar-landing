import { SectionHeading } from "@/components/ui/SectionHeading";
import { getRelatedArticles } from "@/lib/dal/articles";
import { ArticleCard } from "./ArticleCard";

interface RelatedArticlesProps {
  readonly slug: string;
}

export async function RelatedArticles({ slug }: RelatedArticlesProps) {
  const related = await getRelatedArticles(slug, 3);
  if (related.length === 0) return null;

  return (
    <section aria-labelledby="related-articles-heading" className="mt-12 border-t border-surface-border pt-8">
      <SectionHeading title="אולי יעניין אתכם גם" id="related-articles-heading" />
      <div className="grid gap-4 sm:grid-cols-3">
        {related.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}
