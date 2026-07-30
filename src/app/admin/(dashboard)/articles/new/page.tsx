import { ArticleForm } from "@/components/admin/ArticleForm";
import { requireAdmin } from "@/lib/auth/require-admin";

export default async function NewArticlePage() {
  await requireAdmin();

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-bold">כתבה חדשה</h2>
      <ArticleForm />
    </div>
  );
}
