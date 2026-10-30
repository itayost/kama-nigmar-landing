import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";
import { asc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import * as schema from "@/lib/db/schema";
import { applyBackfillPlan, countArticleTags, loadBackfillInput } from "./backfill-apply";
import { planBackfill, type TaxonomyMapping } from "./backfill-plan";
import { PUBLISHED_2026_10_30 } from "./fixtures/published-2026-10-30";
import { TAXONOMY_MAPPING } from "./mapping";

const migrationsFolder = fileURLToPath(new URL("../../../drizzle", import.meta.url));
const SEEDED = [24, 15, 14, 11];

let client: PGlite;
let db: ReturnType<typeof drizzle<typeof schema>>;

beforeEach(async () => {
  client = new PGlite();
  db = drizzle(client, { schema });
  await migrate(db, { migrationsFolder });
  const seeded = PUBLISHED_2026_10_30.filter((a) => SEEDED.includes(a.number));
  for (const name of new Set(seeded.flatMap((a) => a.tags))) {
    await db.insert(schema.tags).values({ name });
  }
  for (const a of seeded) {
    // Explicit numbers so the per-article overrides (#14) apply.
    await db
      .insert(schema.articles)
      .overridingSystemValue()
      .values({
        number: a.number,
        title: a.title,
        subtitle: a.subtitle,
        authorName: "גיא צינקר",
        tags: [...a.tags],
        status: "published",
      });
  }
});

afterEach(async () => {
  await client.close();
});

async function run(mapping: TaxonomyMapping = TAXONOMY_MAPPING) {
  const plan = planBackfill(await loadBackfillInput(db), mapping);
  await applyBackfillPlan(db, plan);
  return plan;
}

async function articleState(number: number) {
  const [article] = await db
    .select({
      id: schema.articles.id,
      tags: schema.articles.tags,
      format: schema.articles.format,
      primary: schema.subjects.slug,
    })
    .from(schema.articles)
    .leftJoin(schema.subjects, eq(schema.subjects.id, schema.articles.primarySubjectId))
    .where(eq(schema.articles.number, number));
  const linked = await db
    .select({ name: schema.tags.name })
    .from(schema.articleTags)
    .innerJoin(schema.tags, eq(schema.tags.id, schema.articleTags.tagId))
    .where(eq(schema.articleTags.articleId, article.id))
    .orderBy(asc(schema.articleTags.position));
  return { ...article, linked: linked.map((row) => row.name) };
}

async function registry() {
  const rows = await db
    .select({ name: schema.tags.name, subject: schema.subjects.slug })
    .from(schema.tags)
    .leftJoin(schema.subjects, eq(schema.subjects.id, schema.tags.subjectId));
  return Object.fromEntries(rows.map((row) => [row.name, row.subject]));
}

describe("loadBackfillInput", () => {
  it("reads every article with its legacy tags and the registry names", async () => {
    const input = await loadBackfillInput(db);
    expect(input.articles.map((a) => a.number)).toEqual([11, 14, 15, 24]);
    expect(input.articles[1].tags).toEqual(["כדורגל", "ליגת אלופות"]);
    expect(input.registry).toContain("כדורגל אנגלי");
  });
});

describe("applyBackfillPlan", () => {
  it("seeds the five subjects with motorsport off the homepage", async () => {
    await run();
    const rows = await db.select().from(schema.subjects).orderBy(asc(schema.subjects.position));
    expect(rows.map((s) => [s.slug, s.onHomepage])).toEqual([
      ["israeli-football", true],
      ["world-football", true],
      ["basketball", true],
      ["olympic-sports", true],
      ["motorsport", false],
    ]);
  });

  it("renames, re-homes and removes registry tags", async () => {
    await run();
    expect(await registry()).toEqual({
      "ליגת העל": "israeli-football",
      "ליגת אלופות": "world-football",
      "פרמייר ליג": "world-football",
      "כדורסל": "basketball",
      "אתלטיקה": "olympic-sports",
      "פורמולה 1": "motorsport",
    });
  });

  it("links a roundup to its tags in their original order, without a primary subject", async () => {
    await run();
    expect(await articleState(15)).toMatchObject({
      format: "roundup",
      primary: null,
      linked: ["ליגת העל", "ליגת אלופות", "כדורסל", "פורמולה 1", "אתלטיקה"],
    });
  });

  it("applies the primary-subject override for #14", async () => {
    await run();
    expect(await articleState(14)).toMatchObject({
      format: "story",
      primary: "israeli-football",
      linked: ["ליגת אלופות"],
    });
  });

  it("leaves the legacy tags column exactly as it was", async () => {
    await run();
    expect((await articleState(11)).tags).toEqual(["כדורגל אנגלי", "כדורגל"]);
  });

  it("gives the same result when applied a second time", async () => {
    await run();
    const before = { registry: await registry(), a15: await articleState(15), a11: await articleState(11) };
    await run();
    expect({ registry: await registry(), a15: await articleState(15), a11: await articleState(11) }).toEqual(
      before,
    );
  });

  it("writes nothing when any step fails", async () => {
    const broken: TaxonomyMapping = { ...TAXONOMY_MAPPING, overrides: { 14: { primarySubject: "curling" } } };
    await expect(run(broken)).rejects.toThrow(/curling/);
    expect(await db.select().from(schema.subjects)).toEqual([]);
    expect(await countArticleTags(db)).toBe(0);
    expect(Object.keys(await registry())).toContain("כדורגל");
  });
});

describe("countArticleTags", () => {
  it("counts the links written by the backfill", async () => {
    expect(await countArticleTags(db)).toBe(0);
    await run();
    // #15 has five tags, #14 and #11 one each, #24 none.
    expect(await countArticleTags(db)).toBe(7);
  });
});
