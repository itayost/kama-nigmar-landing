# Integer Article URLs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Articles are addressed by an auto-assigned integer (`/articles/7`); slug authoring and Hebrew transliteration are removed; old slug URLs permanently redirect.

**Architecture:** Add a Postgres `GENERATED ALWAYS AS IDENTITY` column `number` to `articles`. The `[slug]` route param routes numerically when all-digits, otherwise resolves the legacy `slug` column and issues a permanent redirect. All link builders and cache keys switch from `slug` to `number`.

**Tech Stack:** Next.js App Router (nonstandard version — read `node_modules/next/dist/docs/` before using an unfamiliar API), Drizzle ORM + `drizzle-kit push` (no migration files), Zod, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-08-07-integer-article-urls-design.md`

## Global Constraints

- No emojis anywhere. UI copy is Hebrew RTL.
- Immutability: never mutate objects/arrays.
- Conventional commits (`feat:`, `refactor:`, `test:`, `chore:`).
- Run `npm test` (vitest) after every task; it must pass before committing.
- `DATABASE_URL` comes from `.env.local`; schema changes apply with `npm run db:push` (answer its prompts; the tool may ask to confirm the identity column).
- The `[slug]` route directory name does NOT change; only the interpretation of the param changes.

---

### Task 1: Re-key the recirculation planner on `id` instead of `slug`

**Files:**
- Modify: `src/lib/articles/recirculation.ts`
- Modify: `src/lib/articles/recirculation.test.ts`
- Modify: `src/lib/dal/articles.ts:65-83` (the only production caller)

**Interfaces:**
- Produces: `RecircInput` = `{ id: string; tags: readonly string[]; publishedAt: Date | null }` (no `slug`). `RecircCurrent` = `{ id: string; tags: readonly string[]; blockCount: number }`. `planRecirculation` / `rankTrending` signatures otherwise unchanged.
- Note: `getRecirculation(slug: string)` in the DAL keeps its slug parameter for now (Task 5 changes it); only the object it passes to `planRecirculation` changes.

- [ ] **Step 1: Update the tests to the id-keyed interface**

In `src/lib/articles/recirculation.test.ts`, the `article(slug, …)` factory currently returns `{ id: `id-${slug}`, slug, tags, publishedAt }`. Remove the `slug` field from the returned object (keep the `id-` prefixed id so `views()` keeps working), change `slugs()` to map over `item.id`, and update every expectation to the `id-` prefixed values, e.g. `expect(slugs(plan.midArticle)).toEqual(["id-both", "id-one"])`. Change `longCurrent`-style current objects from `{ slug: "current", … }` to `{ id: "id-current", … }`.

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- recirculation`
Expected: FAIL (type errors / mismatched fields).

- [ ] **Step 3: Update the planner**

In `src/lib/articles/recirculation.ts`: delete `slug` from `RecircInput`; change `RecircCurrent` to `{ readonly id: string; readonly tags: readonly string[]; readonly blockCount: number }`; replace every slug comparison with id: `others = candidates.filter((c) => c.id !== current.id)`, `taken` sets collect `candidate.id`, `relatedScored.some((picked) => picked.id === candidate.id)`.

- [ ] **Step 4: Update the DAL call site**

In `src/lib/dal/articles.ts` `getRecirculation`, keep finding `current` by slug but pass the new shape:

```ts
return planRecirculation(
  { id: current.id, tags: current.tags, blockCount: current.content.length },
  published,
  weeklyViews,
);
```

- [ ] **Step 5: Run tests and typecheck**

Run: `npm test && npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/articles/recirculation.ts src/lib/articles/recirculation.test.ts src/lib/dal/articles.ts
git commit -m "refactor: key recirculation planner on article id"
```

---

### Task 2: Add the `number` identity column

**Files:**
- Modify: `src/lib/db/schema.ts:30-53`

**Interfaces:**
- Produces: `articles.number` — `integer NOT NULL GENERATED ALWAYS AS IDENTITY UNIQUE`. The inferred `Article` type gains `number: number`. `slug` stays `NOT NULL` for now (Task 7 relaxes it).

- [ ] **Step 1: Add the column**

In the `articles` table definition in `src/lib/db/schema.ts`, directly under `id`:

```ts
number: integer("number").generatedAlwaysAsIdentity().unique(),
```

(`integer` is already imported.)

- [ ] **Step 2: Push the schema**

Run: `npm run db:push`
Expected: adds the column; Postgres backfills existing rows with 1, 2, 3… If drizzle-kit warns about adding an identity column to a non-empty table, accept — identity backfill is safe. Verify afterwards: `SELECT number, slug FROM articles ORDER BY number;` via `npm run db:studio` or psql — every row must have a distinct positive number.

- [ ] **Step 3: Typecheck and test**

Run: `npx tsc --noEmit && npm test`
Expected: PASS (column is additive).

- [ ] **Step 4: Commit**

```bash
git add src/lib/db/schema.ts
git commit -m "feat: add auto-assigned number column to articles"
```

---

### Task 3: `parseArticleNumber` route-param helper

**Files:**
- Create: `src/lib/articles/article-param.ts`
- Test: `src/lib/articles/article-param.test.ts`

**Interfaces:**
- Produces: `parseArticleNumber(param: string): number | null` — the article number when the param is its canonical decimal form, otherwise `null` (meaning: treat as legacy slug).

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, test } from "vitest";
import { parseArticleNumber } from "./article-param";

describe("parseArticleNumber", () => {
  test.each([
    ["7", 7],
    ["1", 1],
    ["123456789", 123456789],
  ])("parses canonical number %s", (param, expected) => {
    expect(parseArticleNumber(param)).toBe(expected);
  });

  test.each(["kmh-ngmr-sykvm-hshbv-2-6-8", "07", "0", "-3", "1.5", "1e3", " 7", "", "7a"])(
    "returns null for non-canonical param %j",
    (param) => {
      expect(parseArticleNumber(param)).toBeNull();
    },
  );
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- article-param`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

```ts
// Canonical form only (no leading zeros): "07" must fall through to the
// legacy-slug path so each article has exactly one numeric URL.
const CANONICAL_NUMBER_PATTERN = /^[1-9]\d{0,8}$/;

export function parseArticleNumber(param: string): number | null {
  if (!CANONICAL_NUMBER_PATTERN.test(param)) return null;
  return Number(param);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- article-param`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/articles/article-param.ts src/lib/articles/article-param.test.ts
git commit -m "feat: add canonical article number param parser"
```

---

### Task 4: DAL lookups by number

**Files:**
- Modify: `src/lib/dal/articles.ts`

**Interfaces:**
- Consumes: `articles.number` (Task 2).
- Produces: `getArticleByNumber(number: number): Promise<Article | null>` (published only, cache tags `"articles"` and `` `article-${number}` ``) and `getArticleNumberBySlug(slug: string): Promise<number | null>` (published only, cache tag `"articles"`). `getArticleBySlug` is deleted in Task 5 — leave it in place for this task so the page still compiles.

- [ ] **Step 1: Add the two functions** (below `getArticleBySlug`)

```ts
export async function getArticleByNumber(number: number): Promise<Article | null> {
  "use cache";
  cacheLife("article");
  cacheTag("articles", `article-${number}`);
  const rows = await getDb()
    .select()
    .from(articles)
    .where(and(eq(articles.number, number), eq(articles.status, "published")))
    .limit(1);
  return rows[0] ?? null;
}

// Legacy transliterated slugs resolve to the article number so old shared
// URLs can permanently redirect. Only pre-migration articles have a slug.
export async function getArticleNumberBySlug(slug: string): Promise<number | null> {
  "use cache";
  cacheLife("article");
  cacheTag("articles");
  const rows = await getDb()
    .select({ number: articles.number })
    .from(articles)
    .where(and(eq(articles.slug, slug), eq(articles.status, "published")))
    .limit(1);
  return rows[0]?.number ?? null;
}
```

- [ ] **Step 2: Typecheck and test**

Run: `npx tsc --noEmit && npm test`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/lib/dal/articles.ts
git commit -m "feat: add number-keyed article lookups to the DAL"
```

---

### Task 5: Route the article page by number, redirect legacy slugs

Before touching the page, read `node_modules/next/dist/docs/` for `permanentRedirect` semantics in this Next version (per repo `AGENTS.md`).

**Files:**
- Modify: `src/app/(site)/articles/[slug]/page.tsx`
- Modify: `src/lib/dal/articles.ts` (delete `getArticleBySlug`; re-key `getRecirculation`)
- Modify: `src/components/articles/ShareButton.tsx`
- Modify: `src/components/articles/ViewTracker.tsx`
- Modify: `src/app/api/articles/view/route.ts`
- Modify: `src/lib/seo/schema.ts:55`
- Modify: `src/lib/actions/articles.ts` (cache tags only)

**Interfaces:**
- Consumes: `parseArticleNumber` (Task 3), `getArticleByNumber` / `getArticleNumberBySlug` (Task 4).
- Produces: `getRecirculation(number: number)`; `ShareButton` props `{ title, url, articleNumber: number }`; `ViewTracker` props `{ articleNumber: number }`; view API accepts JSON `{ number: <positive int> }`.

- [ ] **Step 1: Re-key `getRecirculation` and drop `getArticleBySlug`**

In `src/lib/dal/articles.ts`: delete `getArticleBySlug` entirely. Change `getRecirculation(slug: string)` to `getRecirculation(number: number)` and the current-article lookup to `published.find((article) => article.number === number)`.

- [ ] **Step 2: Rewrite the page's param resolution**

In `page.tsx`, add a shared resolver used by both `generateMetadata` and `ArticleContent`:

```ts
import { notFound, permanentRedirect } from "next/navigation";
import { parseArticleNumber } from "@/lib/articles/article-param";
import {
  getArticleByNumber,
  getArticleNumberBySlug,
  getPublishedArticles,
  getRecirculation,
} from "@/lib/dal/articles";

// Numeric params are canonical; anything else is a legacy transliterated
// slug that permanently redirects to the numeric URL (or 404s).
async function resolveArticle(slugParam: string) {
  const number = parseArticleNumber(slugParam);
  if (number !== null) {
    return getArticleByNumber(number);
  }
  const target = await getArticleNumberBySlug(slugParam);
  if (target !== null) {
    permanentRedirect(`/articles/${target}`);
  }
  return null;
}
```

`generateMetadata` and `ArticleContent` both replace `getArticleBySlug(slug)` with `resolveArticle(slug)` (keep the param variable name `slug`; keep the existing not-found handling). The redirect fires inside `generateMetadata` first, which runs before the shell streams, so legacy URLs get a real permanent-redirect response.

- [ ] **Step 3: Switch every URL and key in the page to `number`**

- `generateStaticParams`: `return articles.map((article) => ({ slug: String(article.number) }));`
- `articleUrl` (both places): `` `${SITE_URL}/articles/${article.number}` ``
- breadcrumb: `` url: `${SITE_URL}/articles/${article.number}` ``
- `getRecirculation(article.slug)` → `getRecirculation(article.number)`
- `<ShareButton title={article.title} url={articleUrl} articleNumber={article.number} />`
- `<ViewTracker articleNumber={article.number} />`

- [ ] **Step 4: Update ShareButton and ViewTracker**

`ShareButton`: rename the `slug` prop to `articleNumber: number`; the analytics attribute becomes `data-ph-slug={String(articleNumber)}` (attribute name unchanged so the PostHog event property stays `slug`; the value is now the number).

`ViewTracker`: props become `{ readonly articleNumber: number }`; payload becomes `JSON.stringify({ number: articleNumber })`; effect dependency `[articleNumber]`.

- [ ] **Step 5: Update the view API**

In `src/app/api/articles/view/route.ts`: drop the `slugSchema` import; validate with a local schema and match on `articles.number`:

```ts
import { z } from "zod";

const viewPayloadSchema = z.object({ number: z.number().int().min(1) });
```

Parse `viewPayloadSchema.safeParse(body)` (the whole body, not a field pick), 400 on failure, and change the update's `where` to `and(eq(articles.number, parsed.data.number), eq(articles.status, "published"))`. The rest of the handler (daily rollup, retention pruning) is untouched.

- [ ] **Step 6: Update seo schema and action cache tags**

- `src/lib/seo/schema.ts:55`: `` mainEntityOfPage: `${SITE_URL}/articles/${article.number}` ``.
- `src/lib/actions/articles.ts`: in `saveArticle`, add `number: articles.number` to the existing-article select and capture `previousNumber`; after the write, tag with the number — for updates `updateTag(`article-${previousNumber}`)`; for inserts use `.returning({ number: articles.number })` and tag the returned number. Remove the `article-${parsed.data.slug}` / `previousSlug` tag logic (keep `updateTag("articles")`). In `deleteArticle` and `toggleArticleStatus`, change `` updateTag(`article-${article.slug}`) `` to `` updateTag(`article-${article.number}`) ``.

- [ ] **Step 7: Typecheck, test, build**

Run: `npx tsc --noEmit && npm test && npm run build`
Expected: PASS. Manual smoke: `npm run dev`, open `/articles/<number>` of an existing article and confirm it renders; open its old `/articles/<legacy-slug>` and confirm the browser lands on the numeric URL.

- [ ] **Step 8: Commit**

```bash
git add src/app/\(site\)/articles/\[slug\]/page.tsx src/lib/dal/articles.ts src/components/articles/ShareButton.tsx src/components/articles/ViewTracker.tsx src/app/api/articles/view/route.ts src/lib/seo/schema.ts src/lib/actions/articles.ts
git commit -m "feat: route articles by number with legacy slug redirects"
```

---

### Task 6: Switch remaining link builders to `number`

**Files:**
- Modify: `src/components/articles/ArticleCard.tsx:14-16`
- Modify: `src/components/articles/ArticleMiniCard.tsx:13-15`
- Modify: `src/components/articles/ArticleLeadCard.tsx:15`
- Modify: `src/app/sitemap.ts:30`
- Modify: `src/app/feed.xml/route.ts:10`

**Interfaces:**
- Consumes: `article.number` (Task 2). No new exports.

- [ ] **Step 1: Replace slug with number in each file**

In all five files change `` `/articles/${article.slug}` `` (or `` `${SITE_URL}/articles/${article.slug}` ``) to use `article.number`. In `ArticleCard` and `ArticleMiniCard` also change `data-ph-slug={article.slug}` to `data-ph-slug={article.number}`.

- [ ] **Step 2: Verify no slug-based links remain**

Run: `grep -rn "articles/\${.*slug" src/ ; grep -rn "article.slug" src/components src/app`
Expected: no matches (DAL/actions matches are gone after Task 5; `getArticleNumberBySlug` internals in `src/lib/dal` are the only allowed `articles.slug` use).

- [ ] **Step 3: Typecheck, test, commit**

Run: `npx tsc --noEmit && npm test`

```bash
git add src/components/articles/ArticleCard.tsx src/components/articles/ArticleMiniCard.tsx src/components/articles/ArticleLeadCard.tsx src/app/sitemap.ts src/app/feed.xml/route.ts
git commit -m "feat: build article links from the article number"
```

---

### Task 7: Remove slug authoring from the admin

**Files:**
- Modify: `src/lib/articles/blocks.ts` (delete `slugSchema`; drop `slug` from `articleInputSchema`)
- Modify: `src/lib/articles/blocks.test.ts` (delete the `slugSchema` describe block and the `slug` field in fixtures)
- Modify: `src/lib/actions/articles.ts`
- Modify: `src/components/admin/ArticleForm.tsx`
- Modify: `src/lib/db/schema.ts:34` (slug becomes nullable)
- Delete: `src/components/admin/SlugField.tsx`, `src/lib/slug/transliterate.ts`, `src/lib/slug/transliterate.test.ts` (removes the `src/lib/slug/` directory)

**Interfaces:**
- Consumes: nothing new.
- Produces: `articleInputSchema` without `slug`; `articles.slug` typed `string | null`; inserts omit `slug` (stays NULL for new articles).

- [ ] **Step 1: Update tests first**

In `src/lib/articles/blocks.test.ts`: remove `slugSchema` from the import, delete the entire `describe("slugSchema", …)` block, and remove the `slug: "maccabi-derby"` line (and any other `slug:` fixture fields) from the `articleInputSchema` fixtures. Delete `src/lib/slug/transliterate.test.ts`.

Run: `npm test`
Expected: FAIL — `articleInputSchema` still requires `slug`, so fixtures without it fail parsing.

- [ ] **Step 2: Strip slug from the schema and action**

- `blocks.ts`: delete the `slugSchema` export and the `slug: slugSchema` line in `articleInputSchema`.
- `actions/articles.ts`: remove `slug: formData.get("slug")` from the parse input; remove the `slugTaken` pre-check block (lines 147-154) and `previousSlug` tracking; remove `slug: parsed.data.slug` from `values`; remove the `try/catch` around the insert/update including the `isUniqueViolation` import — the slug unique constraint was its only subject (the tags insert keeps its own `onConflictDoNothing`). Keep the `updateTag` logic exactly as Task 5 left it (number-based).

- [ ] **Step 3: Strip slug from the form**

In `ArticleForm.tsx`: remove the `suggestSlug` and `SlugField` imports, the `slug` / `isSlugTouched` state, the `<SlugField …/>` element, and inline the title handler (`onChange={(event) => setTitle(event.target.value)}`, deleting `handleTitleChange`). Delete `src/components/admin/SlugField.tsx` and `src/lib/slug/transliterate.ts`.

- [ ] **Step 4: Make the column nullable**

In `src/lib/db/schema.ts` change `slug: text("slug").notNull().unique(),` to:

```ts
// Legacy transliterated slugs kept only for permanent redirects; new
// articles are addressed by number and never receive one.
slug: text("slug").unique(),
```

Run: `npm run db:push` (dropping NOT NULL is safe; confirm the prompt).

- [ ] **Step 5: Verify**

Run: `npx tsc --noEmit && npm test && npm run build`
Expected: PASS, and `grep -rn "transliterate\|SlugField\|slugSchema" src/` returns nothing.

- [ ] **Step 6: Commit**

```bash
git add -A src/lib/articles src/lib/actions/articles.ts src/components/admin src/lib/db/schema.ts src/lib/slug
git commit -m "feat: drop slug authoring from the admin"
```

---

### Task 8: Update E2E flows and run full verification

**Files:**
- Modify: `e2e/admin-flow.spec.ts`
- Modify: `e2e/engagement.spec.ts`

**Interfaces:**
- Consumes: the live app behavior from Tasks 5-7 (no slug input; numeric URLs; `/articles` index cards link by number).

- [ ] **Step 1: Rework the shared article-creation helpers**

Both specs currently fill `input[name="slug"]` and navigate to `/articles/${slug}` — that input no longer exists. Pattern for both files: drop `slug` from the options/fixtures, and after saving resolve the article's numeric URL from the public index by its unique title:

```ts
async function findArticleUrl(page: Page, title: string): Promise<string> {
  await page.goto("/articles");
  const href = await page
    .getByRole("link")
    .filter({ has: page.getByRole("heading", { name: title, exact: true }) })
    .first()
    .getAttribute("href");
  expect(href).toMatch(/^\/articles\/\d+$/);
  return href!;
}
```

In `engagement.spec.ts`, have `createArticle` return `await findArticleUrl(page, options.title)` and store it on each fixture (e.g. `const longUrl = await createArticle(page, long)`), replacing every `` page.goto(`/articles/${x.slug}`) `` with `page.goto(xUrl)`. In `admin-flow.spec.ts`, replace the slug constant and both `page.goto(\`/articles/${slug}\`)` calls the same way, and add an assertion that the final page URL is numeric: `await expect(page).toHaveURL(/\/articles\/\d+$/);`.

- [ ] **Step 2: Run the suites**

Run: `npx tsc --noEmit && npm test && npm run test:e2e`
Expected: all pass (e2e needs `E2E_ADMIN_PASSWORD` and a running target per `playwright.config.ts`; if the env var is absent the suites self-skip — in that case say so explicitly rather than claiming e2e verification).

- [ ] **Step 3: Verify the legacy redirect against a real legacy article**

If the database in use contains a pre-migration article (it does in production: `kmh-ngmr-sykvm-hshbv-2-6-8`), verify with dev server running:

Run: `curl -s -o /dev/null -w "%{http_code} %{redirect_url}" http://localhost:3000/articles/<legacy-slug>`
Expected: a 3xx status with `redirect_url` ending in `/articles/<number>`. If the local database has no legacy-slug article, note that this check must be repeated after deploy against production.

- [ ] **Step 4: Commit**

```bash
git add e2e/admin-flow.spec.ts e2e/engagement.spec.ts
git commit -m "test(e2e): drive article flows through numeric URLs"
```
