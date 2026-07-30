import { getPublishedArticles } from "@/lib/dal/articles";
import { escapeXml } from "@/lib/seo/xml";
import { SITE_URL } from "@/lib/site";

export async function GET(): Promise<Response> {
  const articles = await getPublishedArticles();

  const items = articles
    .map((article) => {
      const link = `${SITE_URL}/articles/${article.slug}`;
      const parts = [
        `      <title>${escapeXml(article.title)}</title>`,
        `      <link>${link}</link>`,
        `      <guid isPermaLink="true">${link}</guid>`,
      ];
      if (article.publishedAt) {
        parts.push(`      <pubDate>${article.publishedAt.toUTCString()}</pubDate>`);
      }
      if (article.subtitle) {
        parts.push(`      <description>${escapeXml(article.subtitle)}</description>`);
      }
      for (const tag of article.tags) {
        parts.push(`      <category>${escapeXml(tag)}</category>`);
      }
      return `    <item>\n${parts.join("\n")}\n    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>כמה נגמר? — כתבות</title>
    <link>${SITE_URL}/articles</link>
    <description>כתבות, סיכומים וסרטונים מעולם הספורט — מהפודקאסט כמה נגמר?</description>
    <language>he</language>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
