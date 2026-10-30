import type { ArticleView } from "@/lib/dal/articles";
import type { SubjectSummary } from "@/lib/taxonomy/public";
import { ArticleMiniCard } from "./ArticleMiniCard";
import { subjectStyle } from "./subject";

interface MidArticleRelatedProps {
  readonly articles: readonly ArticleView[];
  // The article's primary subject: the module reads "more in" it.
  readonly subject: SubjectSummary | null;
}

// The in-body recirculation module, placed near the first screen where
// clicks actually happen (research: 400-600px depth). Same-topic only.
export function MidArticleRelated({ articles, subject }: MidArticleRelatedProps) {
  if (articles.length === 0) return null;
  const label = subject ? `עוד ב${subject.name}` : "עוד באותו נושא";

  return (
    <aside
      aria-label={label}
      style={subjectStyle(subject?.color)}
      className="rounded-xl border border-[var(--subject)]/25 bg-[var(--subject)]/[0.04] p-4"
    >
      {/* An h2, not a p: the cards below are h3, so a non-heading label here left
          an h1 -> h3 jump on article pages whose opening blocks carry no heading.
          The explicit type classes keep it visually identical. */}
      <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-[var(--subject)]">
        <span aria-hidden="true" className="h-2 w-2 rounded-[3px] bg-[var(--subject)]" />
        {label}
      </h2>
      <div className="flex flex-col gap-2.5">
        {articles.map((article) => (
          <ArticleMiniCard
            key={article.id}
            article={article}
            phEvent="recirc_mid_click"
          />
        ))}
      </div>
    </aside>
  );
}
