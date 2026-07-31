import { NewTagForm } from "@/components/admin/tags/NewTagForm";
import { TagRow } from "@/components/admin/tags/TagRow";
import { listTagsWithCounts } from "@/lib/dal/tags";

export default async function AdminTagsPage() {
  const tags = await listTagsWithCounts();

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-bold">תגיות</h2>
      <NewTagForm />
      {tags.length === 0 ? (
        <p className="rounded-xl border border-dashed border-surface-border p-12 text-center text-text-muted">
          עדיין אין תגיות — הוסיפו את הראשונה, או צרו תגיות מתוך טופס הכתבה
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {tags.map((tag) => (
            <TagRow
              key={tag.id}
              id={tag.id}
              name={tag.name}
              articleCount={tag.articleCount}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
