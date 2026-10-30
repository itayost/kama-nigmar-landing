import { ArticleForm } from "@/components/admin/ArticleForm";
import { requireAdmin } from "@/lib/auth/require-admin";
import { listPollChoices } from "@/lib/dal/polls";
import { getAdminTaxonomy } from "@/lib/dal/taxonomy-admin";

export default async function NewArticlePage() {
  await requireAdmin();
  const [taxonomy, pollChoices] = await Promise.all([getAdminTaxonomy(), listPollChoices()]);

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-bold">כתבה חדשה</h2>
      <ArticleForm taxonomy={taxonomy} pollChoices={pollChoices} />
    </div>
  );
}
