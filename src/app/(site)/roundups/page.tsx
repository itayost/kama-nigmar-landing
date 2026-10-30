import type { Metadata } from "next";
import { RoundupCard } from "@/components/articles/RoundupCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { ArchiveHeader } from "@/components/ui/ArchiveHeader";
import { getPublishedArticles } from "@/lib/dal/articles";
import { breadcrumbSchema, collectionPageSchema, FEED_ALTERNATE, pageOpenGraph } from "@/lib/seo/schema";
import { SITE_URL } from "@/lib/site";
import { isRoundup, ROUNDUPS } from "@/lib/taxonomy/public";

const page = {
  name: ROUNDUPS.label,
  description: "סיכומי השבוע והסופ״ש של כמה נגמר? — כל מה שקרה בספורט, בישראל ובעולם.",
  url: `${SITE_URL}${ROUNDUPS.href}`,
};

export const metadata: Metadata = {
  title: page.name,
  description: page.description,
  alternates: { canonical: page.url, types: FEED_ALTERNATE },
  openGraph: pageOpenGraph(page),
};

export default async function RoundupsPage() {
  const roundups = (await getPublishedArticles()).filter(isRoundup);

  return (
    <main className="mx-auto w-full max-w-5xl px-6 pb-10">
      <JsonLd data={collectionPageSchema(page)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "בית", url: SITE_URL },
          { name: page.name, url: page.url },
        ])}
      />
      <ArchiveHeader title={page.name} description={page.description} color={ROUNDUPS.color} />
      {roundups.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {roundups.map((article) => (
            <RoundupCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <p className="text-text-muted">עדיין אין סיכומים.</p>
      )}
    </main>
  );
}
