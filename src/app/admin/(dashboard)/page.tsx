import Link from "next/link";
import { DeleteArticleButton } from "@/components/admin/DeleteArticleButton";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { toggleArticleStatus } from "@/lib/actions/articles";
import { listAllArticles } from "@/lib/dal/admin-articles";
import { formatDateShort } from "@/lib/datetime";

export default async function AdminArticlesPage() {
  const articles = await listAllArticles();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">כתבות</h2>
        <Link
          href="/admin/articles/new"
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-bg-start transition-all hover:shadow-[0_0_20px_rgba(46,204,64,0.4)]"
        >
          + כתבה חדשה
        </Link>
      </div>

      {articles.length === 0 ? (
        <p className="rounded-xl border border-dashed border-surface-border p-12 text-center text-text-muted">
          עדיין אין כתבות — צרו את הראשונה
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {articles.map((article) => (
            <li
              key={article.id}
              className="flex flex-col gap-3 rounded-xl border border-surface-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  <span className="font-medium">{article.title}</span>
                  <StatusBadge status={article.status} />
                </div>
                <span className="text-sm text-text-muted">
                  {article.publishedAt
                    ? formatDateShort(article.publishedAt)
                    : "טרם פורסם"}
                  {" · "}
                  {article.authorName}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/admin/articles/${article.id}/edit`}
                  className="whitespace-nowrap rounded-md border border-surface-border px-3 py-1.5 text-sm transition-colors hover:border-accent/50"
                >
                  עריכה
                </Link>
                <form action={toggleArticleStatus}>
                  <input type="hidden" name="id" value={article.id} />
                  <button
                    type="submit"
                    className="whitespace-nowrap rounded-md border border-surface-border px-3 py-1.5 text-sm transition-colors hover:border-accent/50"
                  >
                    {article.status === "published" ? "הסרת פרסום" : "פרסום"}
                  </button>
                </form>
                <DeleteArticleButton articleId={article.id} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
