import { describe, expect, it } from "vitest";
import type { ArticleFormat } from "./format";
import {
  planHomepage,
  planSubjectPage,
  subjectSummary,
  viaTag,
  withTaxonomy,
  type SubjectSummary,
  type TagSummary,
} from "./public";

function subject(id: string, position: number, onHomepage = true): SubjectSummary {
  return { id, name: `נושא ${id}`, slug: `s-${id}`, color: "#123456", description: null, position, onHomepage };
}

const IL = subject("il", 1);
const WF = subject("wf", 2);
const BB = subject("bb", 3);
const MS = subject("ms", 5, false);
const SUBJECTS = new Map([IL, WF, BB, MS].map((s) => [s.id, s]));

const tag = (id: string, subjectId: string | null): TagSummary => ({ id, name: `תגית ${id}`, subjectId });
const LIGA = tag("liga", "il");
const UCL = tag("ucl", "wf");
const NBA = tag("nba", "bb");
const F1 = tag("f1", "ms");
const INBOX = tag("legion", null);

let seq = 0;
function article(primary: string | null, tags: TagSummary[], format: ArticleFormat = "story") {
  seq += 1;
  const id = `a${seq}`;
  return withTaxonomy({ id, primarySubjectId: primary, format }, SUBJECTS, new Map([[id, tags]]));
}

describe("withTaxonomy", () => {
  it("attaches the primary subject, the ordered tags and the other subjects", () => {
    const a = article("il", [UCL, LIGA, NBA, INBOX]);
    expect(a.subject).toBe(IL);
    expect(a.tagList).toEqual([UCL, LIGA, NBA, INBOX]);
    expect(a.subjects.map((s) => s.id)).toEqual(["il", "wf", "bb"]);
    expect(a.alsoIn).toEqual([WF, BB]);
  });

  it("puts a roundup without a primary subject on every subject its tags reach", () => {
    const a = article(null, [F1, LIGA], "roundup");
    expect(a.subject).toBeNull();
    expect(a.subjects.map((s) => s.id)).toEqual(["il", "ms"]);
    expect(a.alsoIn).toEqual([IL, MS]);
  });

  it("copes with an article that has no tags", () => {
    expect(article("wf", []).subjects.map((s) => s.id)).toEqual(["wf"]);
  });
});

describe("planHomepage", () => {
  const subjects = [IL, WF, BB, MS];

  it("leads with the newest story and keeps it out of every section", () => {
    const lead = article("il", [LIGA]);
    const rest = [article("il", [LIGA]), article("il", []), article("il", []), article("il", [])];
    const plan = planHomepage([lead, ...rest], subjects);
    expect(plan.lead).toBe(lead);
    expect(plan.sections[0].articles).toEqual(rest);
    expect(plan.sections[0].total).toBe(5);
  });

  it("gives a subject with three or more primary articles a full section, fewer a compact row, none nothing", () => {
    const lead = article("wf", []);
    const il = [article("il", []), article("il", []), article("il", [])];
    const wf = [article("wf", [])];
    const bbRoundup = article(null, [NBA], "roundup");
    const plan = planHomepage([lead, ...il, ...wf, bbRoundup], subjects);
    expect(plan.sections.map((s) => [s.subject.id, s.variant, s.articles.length])).toEqual([
      ["il", "full", 3],
      ["wf", "compact", 1],
    ]);
  });

  it("shows at most five articles in a full section", () => {
    const many = Array.from({ length: 8 }, () => article("il", []));
    expect(planHomepage(many, subjects).sections[0].articles).toHaveLength(5);
  });

  it("collects the three newest roundups in their own strip, never as the lead", () => {
    const roundups = [article(null, [LIGA], "roundup"), article("wf", [UCL], "roundup")];
    const story = article("bb", [NBA]);
    const plan = planHomepage([...roundups, story, article(null, [NBA], "roundup"), article(null, [], "roundup")], subjects);
    expect(plan.lead).toBe(story);
    expect(plan.roundups).toHaveLength(3);
    expect(plan.roundups[0]).toBe(roundups[0]);
  });

  it("skips subjects switched off the homepage", () => {
    const ms = [article("ms", []), article("ms", []), article("ms", []), article("ms", [])];
    expect(planHomepage(ms, subjects).sections).toEqual([]);
  });
});

describe("planSubjectPage", () => {
  it("dates the page by its newest article, even a roundup newer than the lead", () => {
    const roundup = article(null, [LIGA], "roundup");
    const story = article("il", [LIGA]);
    const plan = planSubjectPage([roundup, story], IL, { limit: 12 });
    expect(plan.lead).toBe(story);
    expect(plan.latest).toBe(roundup);
  });

  const lead = article("il", [LIGA]);
  const cross = article("wf", [UCL, LIGA]);
  const roundup = article(null, [LIGA, NBA], "roundup");
  const plain = article("il", []);
  const elsewhere = article("bb", [NBA]);
  const all = [roundup, lead, cross, plain, elsewhere];

  it("leads with the newest story whose primary subject this is", () => {
    const page = planSubjectPage(all, IL, { limit: 12 });
    expect(page.lead).toBe(lead);
    expect(page.items).toEqual([roundup, cross, plain]);
    expect(page.total).toBe(4);
  });

  it("builds the tag rail from this subject's tags, busiest first", () => {
    const page = planSubjectPage(all, IL, { limit: 12 });
    expect(page.rail).toEqual([{ name: LIGA.name, count: 3 }]);
  });

  it("filters by a rail tag and brings the lead back when it matches", () => {
    const page = planSubjectPage(all, IL, { tag: LIGA.name, limit: 12 });
    expect(page.activeTag).toBe(LIGA.name);
    expect(page.items).toEqual([roundup, lead, cross]);
  });

  it("ignores a tag that is not on the rail", () => {
    const page = planSubjectPage(all, IL, { tag: NBA.name, limit: 12 });
    expect(page.activeTag).toBeNull();
    expect(page.items).toEqual([roundup, cross, plain]);
  });

  it("stops at the limit and says there is more", () => {
    const page = planSubjectPage(all, IL, { limit: 2 });
    expect(page.items).toEqual([roundup, cross]);
    expect(page.hasMore).toBe(true);
  });
});

describe("viaTag", () => {
  it("names the subject's tag that brought another subject's article in", () => {
    expect(viaTag(article(null, [UCL, NBA], "roundup"), BB)).toEqual(NBA);
  });

  it("is empty for an article primarily about the subject", () => {
    expect(viaTag(article("bb", [NBA]), BB)).toBeNull();
  });
});

describe("subjectSummary", () => {
  it("matches the subject page's lead, latest and total", () => {
    const all = [article(null, [LIGA], "roundup"), article("il", []), article("wf", [LIGA]), article("bb", [])];
    const page = planSubjectPage(all, IL, { limit: 12 });
    expect(subjectSummary(all, IL)).toEqual({ lead: page.lead, latest: page.latest, total: page.total });
  });
});
