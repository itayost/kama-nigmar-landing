import { SectionHeading } from "@/components/ui/SectionHeading";
import type { RecirculationPlan } from "@/lib/articles/recirculation";
import type { ArticleView } from "@/lib/dal/articles";
import { subjectPath, type SubjectSummary } from "@/lib/taxonomy/public";
import { ArticleTile } from "./ArticleTile";

// A 96px row thumbnail on a phone; three across inside the article column,
// about 240px each, from the small breakpoint up.
const RECIRC_CARD_SIZES = "(max-width: 640px) 96px, 240px";

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
            linkHref={subject ? subjectPath(subject.slug) : undefined}
            linkLabel={subject ? "לכל הכתבות בנושא" : undefined}
          />
          <ArticleList articles={plan.related} phEvent="recirc_related_click" />
        </section>
      ) : null}
      {plan.trending.length > 0 ? (
        <section aria-labelledby="trending-articles-heading">
          <SectionHeading title="הנקראות ביותר" id="trending-articles-heading" />
          <ArticleList articles={plan.trending} phEvent="recirc_trending_click" />
        </section>
      ) : null}
    </div>
  );
}

function ArticleList({ articles, phEvent }: { readonly articles: readonly ArticleView[]; readonly phEvent: string }) {
  return (
    <div className="flex flex-col sm:grid sm:grid-cols-3 sm:gap-4">
      {articles.map((article) => (
        <ArticleTile key={article.id} article={article} phEvent={phEvent} sizes={RECIRC_CARD_SIZES} />
      ))}
    </div>
  );
}
