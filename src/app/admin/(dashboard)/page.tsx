import Link from "next/link";
import type { CSSProperties } from "react";
import { DeleteArticleButton } from "@/components/admin/DeleteArticleButton";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { toggleArticleStatus } from "@/lib/actions/articles";
import { listAllArticles } from "@/lib/dal/admin-articles";
import { getAdminSubjects } from "@/lib/dal/taxonomy-admin";
import { formatDateShort } from "@/lib/datetime";
import { FORMAT_LABELS } from "@/lib/taxonomy/format";

export default async function AdminArticlesPage() {
  const [articles, subjectList] = await Promise.all([listAllArticles(), getAdminSubjects()]);
  const subjectById = new Map(subjectList.map((subject) => [subject.id, subject]));

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
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                  <span className="font-medium">{article.title}</span>
                  <StatusBadge status={article.status} />
                  <SubjectLabel
                    subject={article.primarySubjectId ? subjectById.get(article.primarySubjectId) : undefined}
                    format={article.format}
                  />
                </div>
                <span className="text-sm text-text-muted">
                  {article.publishedAt
                    ? formatDateShort(article.publishedAt)
                    : "טרם פורסם"}
                  {" · "}
                  {article.authorName}
                  {article.views > 0 ? ` · ${article.views} צפיות` : ""}
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

function SubjectLabel({
  subject,
  format,
}: {
  readonly subject?: { readonly name: string; readonly color: string };
  readonly format: keyof typeof FORMAT_LABELS;
}) {
  const formatLabel = format === "story" ? null : (
    <span className="rounded-md border border-surface-border px-2 py-0.5 text-xs text-text-muted">
      {FORMAT_LABELS[format]}
    </span>
  );
  if (subject) {
    return (
      <>
        <span
          style={{ "--subject": subject.color } as CSSProperties}
          className="rounded-md bg-[var(--subject)] px-2 py-0.5 text-xs font-extrabold text-bg-start"
        >
          {subject.name}
        </span>
        {formatLabel}
      </>
    );
  }
  // A roundup across subjects has no primary subject on purpose.
  if (format === "roundup") return formatLabel;
  return (
    <span className="rounded-md border border-amber-400/50 px-2 py-0.5 text-xs text-amber-300">
      ללא נושא
    </span>
  );
}
