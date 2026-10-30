import Link from "next/link";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { RecirculationPlan } from "@/lib/articles/recirculation";
import type { ArticleView } from "@/lib/dal/articles";
import { formatDateShort } from "@/lib/datetime";
import { subjectPath, type SubjectSummary } from "@/lib/taxonomy/public";
import { CoverImage, subjectStyle } from "./subject";

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

// One link per article: a compact row on a phone, where three stacked cards
// would bury the next article, and a card from the small breakpoint up.
function ArticleList({ articles, phEvent }: { readonly articles: readonly ArticleView[]; readonly phEvent: string }) {
  return (
    <div className="flex flex-col sm:grid sm:grid-cols-3 sm:gap-4">
      {articles.map((article) => (
        <Link
          key={article.id}
          href={`/articles/${article.number}`}
          data-ph-event={phEvent}
          data-ph-slug={article.number}
          style={subjectStyle(article.subject?.color)}
          className="group grid grid-cols-[6rem_minmax(0,1fr)] items-start gap-3 border-b border-surface-border py-3 last:border-b-0 sm:flex sm:flex-col sm:items-stretch sm:gap-0 sm:overflow-hidden sm:rounded-xl sm:border sm:bg-surface sm:py-0 sm:transition-colors sm:last:border-b sm:hover:border-[var(--subject)]/45"
        >
          <div className="relative aspect-[3/2] overflow-hidden rounded-lg bg-surface sm:aspect-video sm:rounded-none">
            <CoverImage
              article={article}
              sizes={RECIRC_CARD_SIZES}
              className="transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transform-none"
              labelClassName="text-[0.65rem] sm:text-base"
            />
          </div>
          <div className="flex min-w-0 flex-col gap-1 sm:p-4">
            <h3 className="text-[0.95rem] font-bold leading-snug text-pretty transition-colors group-hover:text-[var(--subject)] sm:text-base">
              {article.title}
            </h3>
            {article.publishedAt ? (
              <span className="text-xs text-text-muted">{formatDateShort(article.publishedAt)}</span>
            ) : null}
          </div>
        </Link>
      ))}
    </div>
  );
}
