import { SectionHeading } from "@/components/ui/SectionHeading";
import type { RecirculationPlan } from "@/lib/articles/recirculation";
import type { Article } from "@/lib/db/schema";
import { ArticleCard } from "./ArticleCard";

interface RecirculationSectionsProps {
  readonly plan: RecirculationPlan<Article>;
}

export function RecirculationSections({ plan }: RecirculationSectionsProps) {
  if (plan.related.length === 0 && plan.trending.length === 0) return null;

  return (
    <div className="mt-12 flex flex-col gap-10 border-t border-surface-border pt-8">
      {plan.related.length > 0 ? (
        <section aria-labelledby="related-articles-heading">
          <SectionHeading title="עוד באותו נושא" id="related-articles-heading" />
          <div className="grid gap-4 sm:grid-cols-3">
            {plan.related.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                phEvent="recirc_related_click"
              />
            ))}
          </div>
        </section>
      ) : null}
      {plan.trending.length > 0 ? (
        <section aria-labelledby="trending-articles-heading">
          <SectionHeading title="הנקראות ביותר" id="trending-articles-heading" />
          <div className="grid gap-4 sm:grid-cols-3">
            {plan.trending.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                phEvent="recirc_trending_click"
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
