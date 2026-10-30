import { cacheLife, cacheTag } from "next/cache";
import { getPublishedArticles } from "./articles";
import { getSubjects } from "./taxonomy";

export interface NavSubject {
  readonly slug: string;
  readonly name: string;
  readonly color: string;
  readonly count: number;
  readonly latest: string | null;
}

export interface Navigation {
  // Subjects switched on for the site, in the admin's order.
  readonly subjects: readonly NavSubject[];
  readonly roundups: { readonly count: number; readonly latest: string | null };
  readonly total: number;
}

export async function getNavigation(): Promise<Navigation> {
  "use cache";
  cacheLife("article");
  cacheTag("articles");
  const [articles, subjects] = await Promise.all([getPublishedArticles(), getSubjects()]);
  const roundups = articles.filter((article) => article.format === "roundup");
  return {
    subjects: subjects
      .filter((subject) => subject.onHomepage)
      .map((subject) => {
        const members = articles.filter((article) => article.subjectIds.includes(subject.id));
        return {
          slug: subject.slug,
          name: subject.name,
          color: subject.color,
          count: members.length,
          latest: members[0]?.title ?? null,
        };
      }),
    roundups: { count: roundups.length, latest: roundups[0]?.title ?? null },
    total: articles.length,
  };
}
