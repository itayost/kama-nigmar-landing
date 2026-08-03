import type { Article } from "@/lib/db/schema";
import { ArticleMiniCard } from "./ArticleMiniCard";

interface MidArticleRelatedProps {
  readonly articles: readonly Article[];
}

// The in-body recirculation module, placed near the first screen where
// clicks actually happen (research: 400-600px depth). Same-topic only.
export function MidArticleRelated({ articles }: MidArticleRelatedProps) {
  if (articles.length === 0) return null;

  return (
    <aside
      aria-label="עוד באותו נושא"
      className="rounded-xl border border-surface-border border-s-[3px] border-s-accent bg-white/[0.03] p-4"
    >
      {/* An h2, not a p: the cards below are h3, so a non-heading label here left
          an h1 -> h3 jump on article pages whose opening blocks carry no heading.
          The explicit type classes keep it visually identical. */}
      <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-accent">
        <span
          aria-hidden="true"
          className="h-2 w-2 rounded-[3px] bg-accent shadow-[0_0_10px_rgba(46,204,64,0.6)]"
        />
        עוד באותו נושא
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
