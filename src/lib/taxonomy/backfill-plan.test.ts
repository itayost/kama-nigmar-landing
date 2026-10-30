import { describe, expect, it } from "vitest";
import {
  planBackfill,
  type BackfillArticle,
  type TaxonomyMapping,
} from "./backfill-plan";

const mapping: TaxonomyMapping = {
  subjects: [
    { slug: "il", name: "כדורגל ישראלי", position: 1, onHomepage: true },
    { slug: "wf", name: "כדורגל עולמי", position: 2, onHomepage: true },
    { slug: "bb", name: "כדורסל", position: 3, onHomepage: true },
  ],
  tags: {
    "כדורגל": { kind: "retire", impliedBy: ["il", "wf"] },
    "כדורגל ישראלי": { kind: "subject", subject: "il" },
    "סוף שבוע": { kind: "format", format: "roundup" },
    "ליגת העל": { kind: "tag", subject: "il" },
    "ליגת אלופות": { kind: "tag", subject: "wf" },
    "כדורגל אנגלי": { kind: "tag", subject: "wf", rename: "פרמייר ליג" },
    "כדורסל": { kind: "tag", subject: "bb" },
    "ליגיונרים": { kind: "tag", subject: null },
  },
  overrides: { 6: { primarySubject: "il" } },
};

function article(
  number: number,
  tags: string[],
  title = "כתבה",
  subtitle: string | null = null,
): BackfillArticle {
  return { id: `id-${number}`, number, title, subtitle, tags };
}

function planOne(a: BackfillArticle) {
  return planBackfill({ articles: [a], registry: [] }, mapping).articles[0];
}

describe("planBackfill: articles", () => {
  it("turns a subject tag into the primary subject and removes it from the tags", () => {
    const plan = planOne(article(1, ["כדורגל ישראלי", "ליגת העל"]));
    expect(plan.primarySubject).toBe("il");
    expect(plan.tags).toEqual([{ name: "ליגת העל", subject: "il" }]);
    expect(plan.subjects).toEqual(["il"]);
    expect(plan.flags).toEqual([]);
  });

  it("drops a retired tag and takes the primary subject from the first remaining tag", () => {
    const plan = planOne(article(1, ["כדורגל", "ליגת אלופות"]));
    expect(plan.tags).toEqual([{ name: "ליגת אלופות", subject: "wf" }]);
    expect(plan.primarySubject).toBe("wf");
  });

  it("keeps renamed tags in their original position", () => {
    const plan = planOne(article(1, ["ליגת העל", "כדורגל אנגלי"]));
    expect(plan.tags.map((tag) => tag.name)).toEqual(["ליגת העל", "פרמייר ליג"]);
  });

  it("collapses a tag that appears twice once renamed", () => {
    const plan = planOne(article(1, ["כדורגל אנגלי", "פרמייר ליג"]));
    expect(plan.tags).toEqual([{ name: "פרמייר ליג", subject: "wf" }]);
  });

  it("turns the format tag into the article's format", () => {
    const plan = planOne(article(1, ["סוף שבוע", "כדורסל"]));
    expect(plan.format).toBe("roundup");
    expect(plan.tags.map((tag) => tag.name)).toEqual(["כדורסל"]);
  });

  it("treats a title or subtitle mentioning סיכום as a roundup", () => {
    const plan = planOne(
      article(1, ["ליגת אלופות"], "מחזור ראשון באלופות", "סיכום תוצאות המחזור"),
    );
    expect(plan.format).toBe("roundup");
  });

  it("keeps a story whose subtitle only uses סיכום in passing", () => {
    expect(planOne(article(1, ["ליגת העל"], "כתבה", "לסיכום, העונה רק מתחילה")).format).toBe("story");
  });

  it("treats a title mentioning מדריך as a guide", () => {
    expect(planOne(article(1, ["ליגת אלופות"], "המדריך המלא")).format).toBe("guide");
  });

  it("defaults to a story", () => {
    expect(planOne(article(1, ["ליגת אלופות"])).format).toBe("story");
  });

  it("gives a single-subject roundup that subject as primary", () => {
    expect(planOne(article(1, ["סוף שבוע", "ליגת אלופות"])).primarySubject).toBe("wf");
  });

  it("leaves a roundup across subjects without a primary subject, unflagged", () => {
    const plan = planOne(article(1, ["סוף שבוע", "ליגת העל", "כדורסל"]));
    expect(plan.primarySubject).toBeNull();
    expect(plan.subjects).toEqual(["il", "bb"]);
    expect(plan.flags).toEqual([]);
  });

  it("flags lost coverage when a retired tag leaves none of the subjects it implied", () => {
    const plan = planOne(article(1, ["סוף שבוע", "כדורגל", "כדורסל"]));
    expect(plan.primarySubject).toBeNull();
    expect(plan.flags).toEqual(["lost-coverage"]);
  });

  it("does not flag lost coverage when an implied subject is still present", () => {
    const plan = planOne(article(1, ["סוף שבוע", "כדורגל", "ליגת העל", "כדורסל"]));
    expect(plan.flags).toEqual([]);
  });

  it("flags a story left without any subject", () => {
    const plan = planOne(article(1, ["כדורגל"]));
    expect(plan.primarySubject).toBeNull();
    expect(plan.subjects).toEqual([]);
    expect(plan.flags).toEqual(["no-subject", "no-primary", "lost-coverage"]);
  });

  it("keeps inbox tags on the article and flags them", () => {
    const plan = planOne(article(1, ["ליגיונרים", "ליגת העל"]));
    expect(plan.tags).toEqual([
      { name: "ליגיונרים", subject: null },
      { name: "ליגת העל", subject: "il" },
    ]);
    expect(plan.primarySubject).toBe("il");
    expect(plan.flags).toEqual(["inbox-tag"]);
  });

  it("sends tags the mapping does not know to the inbox and flags them", () => {
    const plan = planOne(article(1, ["NBA"]));
    expect(plan.tags).toEqual([{ name: "NBA", subject: null }]);
    expect(plan.flags).toEqual(["no-subject", "no-primary", "unmapped-tag"]);
  });

  it("applies per-article overrides over derived values", () => {
    const plan = planOne(article(6, ["ליגת אלופות"]));
    expect(plan.primarySubject).toBe("il");
    expect(plan.subjects).toEqual(["il", "wf"]);
  });
});

describe("planBackfill: tag registry", () => {
  const articles = [article(1, ["כדורגל", "כדורגל אנגלי", "כדורסל"]), article(2, ["ליגת העל"])];
  const registry = ["כדורגל", "כדורגל ישראלי", "ליגת העל", "כדורגל אנגלי", "ליגיונרים", "ישן"];

  it("deletes tags that became a subject, a format or were retired", () => {
    const plan = planBackfill({ articles, registry }, mapping);
    expect(new Set(plan.tags.deletes)).toEqual(new Set(["כדורגל", "כדורגל ישראלי"]));
  });

  it("renames a tag in place when the new name is free", () => {
    const plan = planBackfill({ articles, registry }, mapping);
    expect(plan.tags.renames).toEqual([{ from: "כדורגל אנגלי", to: "פרמייר ליג" }]);
  });

  it("merges a renamed tag into an existing tag of the new name", () => {
    const plan = planBackfill({ articles, registry: [...registry, "פרמייר ליג"] }, mapping);
    expect(plan.tags.renames).toEqual([]);
    expect(plan.tags.deletes).toContain("כדורגל אנגלי");
  });

  it("inserts tags used on articles but missing from the registry", () => {
    const plan = planBackfill({ articles, registry }, mapping);
    expect(plan.tags.inserts).toEqual(["כדורסל"]);
  });

  it("keeps every surviving tag with its subject, leaving unknown tags in the inbox", () => {
    const plan = planBackfill({ articles, registry }, mapping);
    expect(new Set(plan.tags.keep)).toEqual(
      new Set([
        { name: "ליגת העל", subject: "il" },
        { name: "פרמייר ליג", subject: "wf" },
        { name: "כדורסל", subject: "bb" },
        { name: "ליגיונרים", subject: null },
        { name: "ישן", subject: null },
      ]),
    );
  });

  it("plans the same articles and no registry changes when run again", () => {
    const first = planBackfill({ articles, registry }, mapping);
    const registryAfter = first.tags.keep.map((tag) => tag.name);
    const second = planBackfill({ articles, registry: registryAfter }, mapping);
    expect(second.articles).toEqual(first.articles);
    expect(second.tags.renames).toEqual([]);
    expect(second.tags.deletes).toEqual([]);
    expect(second.tags.inserts).toEqual([]);
  });

  it("passes the subject seeds through", () => {
    const plan = planBackfill({ articles, registry }, mapping);
    expect(plan.subjects.map((subject) => subject.slug)).toEqual(["il", "wf", "bb"]);
  });
});
