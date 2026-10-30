import { TaxonomyBoard } from "@/components/admin/taxonomy/TaxonomyBoard";
import { getAdminTaxonomy } from "@/lib/dal/taxonomy-admin";

export default async function AdminTaxonomyPage() {
  const taxonomy = await getAdminTaxonomy();

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold">נושאים ותגיות</h2>
      <TaxonomyBoard subjects={taxonomy.subjects} tags={taxonomy.tags} />
    </div>
  );
}
