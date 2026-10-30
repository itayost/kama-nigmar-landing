import type { Metadata } from "next";
import { RoundupCard } from "@/components/articles/RoundupCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { getPublishedArticles } from "@/lib/dal/articles";
import { breadcrumbSchema, FEED_ALTERNATE } from "@/lib/seo/schema";
import { SITE_URL } from "@/lib/site";

const pageUrl = `${SITE_URL}/roundups`;
const description = "סיכומי השבוע והסופ״ש של כמה נגמר? — כל מה שקרה בספורט, בישראל ובעולם.";

export const metadata: Metadata = {
  title: "סיכומים",
  description,
  alternates: { canonical: pageUrl, types: FEED_ALTERNATE },
};

export default async function RoundupsPage() {
  const roundups = (await getPublishedArticles()).filter((article) => article.format === "roundup");

  return (
    <main className="mx-auto w-full max-w-5xl px-6 pb-10">
      <JsonLd
        data={breadcrumbSchema([
          { name: "בית", url: SITE_URL },
          { name: "סיכומים", url: pageUrl },
        ])}
      />
      <header className="mb-8 border-b-[3px] border-white pt-8 pb-5 md:pt-10">
        <h1 className="text-[clamp(2.4rem,1.6rem+3.6vw,4rem)] leading-[0.95] font-black tracking-tight">סיכומים</h1>
        <p className="mt-3 text-[0.95rem] text-white/75">{description}</p>
      </header>
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
