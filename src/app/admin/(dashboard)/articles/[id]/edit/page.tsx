import { notFound } from "next/navigation";
import { ArticleForm } from "@/components/admin/ArticleForm";
import { getArticleById } from "@/lib/dal/admin-articles";
import { getPollById, listPollChoices } from "@/lib/dal/polls";
import { listTagNames } from "@/lib/dal/tags";

export default async function EditArticlePage({
  params,
}: PageProps<"/admin/articles/[id]/edit">) {
  const { id } = await params;
  const [article, tagSuggestions, choices] = await Promise.all([
    getArticleById(id),
    listTagNames(),
    listPollChoices(),
  ]);
  if (!article) {
    notFound();
  }

  // A linked poll that has since closed is missing from the choices; append it
  // so the select keeps showing the current link instead of silently clearing it.
  const linkedButClosed =
    article.pollId && !choices.some((choice) => choice.id === article.pollId)
      ? await getPollById(article.pollId)
      : null;
  const pollChoices = linkedButClosed
    ? [...choices, { id: linkedButClosed.id, question: linkedButClosed.question, status: linkedButClosed.status }]
    : choices;

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-bold">עריכת כתבה</h2>
      <ArticleForm article={article} tagSuggestions={tagSuggestions} pollChoices={pollChoices} />
    </div>
  );
}
