import { notFound } from "next/navigation";
import { ArticleForm } from "@/components/admin/ArticleForm";
import { getArticleById } from "@/lib/dal/admin-articles";
import { listTagNames } from "@/lib/dal/tags";

export default async function EditArticlePage({
  params,
}: PageProps<"/admin/articles/[id]/edit">) {
  const { id } = await params;
  const [article, tagSuggestions] = await Promise.all([
    getArticleById(id),
    listTagNames(),
  ]);
  if (!article) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-bold">עריכת כתבה</h2>
      <ArticleForm article={article} tagSuggestions={tagSuggestions} />
    </div>
  );
}
