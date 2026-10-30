import { cacheLife, cacheTag } from "next/cache";
import { inSubject, isRoundup, ROUNDUPS, subjectPath } from "@/lib/taxonomy/public";
import { getPublishedArticles } from "./articles";
import { getSubjects } from "./taxonomy";

// A destination in the site's navigation: a subject, or the roundups.
export interface NavEntry {
  readonly href: string;
  readonly label: string;
  readonly color: string;
  readonly count: number;
  // The newest headline there, shown under the entry in the phone menu.
  readonly latest: string | null;
}

export interface Navigation {
  // Subjects switched on for the site, in the admin's order, then roundups.
  readonly sections: readonly NavEntry[];
  readonly total: number;
}

export async function getNavigation(): Promise<Navigation> {
  "use cache";
  cacheLife("article");
  cacheTag("articles");
  const [articles, subjects] = await Promise.all([getPublishedArticles(), getSubjects()]);
  const entry = (href: string, label: string, color: string, members: readonly { readonly title: string }[]) => ({
    href,
    label,
    color,
    count: members.length,
    latest: members[0]?.title ?? null,
  });
  return {
    sections: [
      ...subjects
        .filter((subject) => subject.onHomepage)
        .map((subject) =>
          entry(subjectPath(subject.slug), subject.name, subject.color, articles.filter((article) => inSubject(article, subject.id))),
        ),
      entry(ROUNDUPS.href, ROUNDUPS.label, ROUNDUPS.color, articles.filter(isRoundup)),
    ],
    total: articles.length,
  };
}
