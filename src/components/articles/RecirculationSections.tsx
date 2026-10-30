import { SectionHeading } from "@/components/ui/SectionHeading";
import type { RecirculationPlan } from "@/lib/articles/recirculation";
import type { ArticleView } from "@/lib/dal/articles";
import type { SubjectSummary } from "@/lib/taxonomy/public";
import { ArticleCard } from "./ArticleCard";

interface RecirculationSectionsProps {
  readonly plan: RecirculationPlan<ArticleView>;
  // The article's primary subject: related stories are "more in" it.
  readonly subject: SubjectSummary | null;
}

export function RecirculationSections({ plan, subject }: RecirculationSectionsProps) {
  if (plan.related.length === 0 && plan.trending.length === 0) return null;

  return (
    <div className="mt-12 flex flex-col gap-10 border-t border-surface-border pt-8">
      {plan.related.length > 0 ? (
        <section aria-labelledby="related-articles-heading">
          <SectionHeading
            title={subject ? `עוד ב${subject.name}` : "עוד באותו נושא"}
            id="related-articles-heading"
            color={subject?.color}
            linkHref={subject ? `/topics/${subject.slug}` : undefined}
            linkLabel={subject ? "לכל הכתבות בנושא" : undefined}
          />
          <div className="grid gap-4 sm:grid-cols-3">
            {plan.related.map((article) => (
              <ArticleCard key={article.id} article={article} phEvent="recirc_related_click" />
            ))}
          </div>
        </section>
      ) : null}
      {plan.trending.length > 0 ? (
        <section aria-labelledby="trending-articles-heading">
          <SectionHeading title="הנקראות ביותר" id="trending-articles-heading" />
          <div className="grid gap-4 sm:grid-cols-3">
            {plan.trending.map((article) => (
              <ArticleCard key={article.id} article={article} phEvent="recirc_trending_click" />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
