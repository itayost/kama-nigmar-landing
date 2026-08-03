# Graph Report - kama-nigmar-landing  (2026-08-03)

## Corpus Check
- 123 files · ~122,468 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 554 nodes · 1025 edges · 31 communities (28 shown, 3 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.7)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d5d889cb`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- db/schema.ts
- [slug]/page.tsx
- ArticleForm.tsx
- (site)/layout.tsx
- dependencies
- Article
- auth.ts
- parseVideoUrl.ts
- compilerOptions
- blocks.ts
- devDependencies
- actions/polls.ts
- manifest.json
- recirculation.ts
- BlockItemEditor.tsx
- eslint.config.mjs
- next.config.ts
- postcss.config.mjs
- Neon
- BlockEditor.tsx
- ArticleBlock
- Neon Serverless Postgres
- transliterate.ts

## God Nodes (most connected - your core abstractions)
1. `getDb()` - 30 edges
2. `requireAdmin()` - 25 edges
3. `Article` - 19 edges
4. `compilerOptions` - 16 edges
5. `ArticleBlock` - 13 edges
6. `parseVideoUrl()` - 13 edges
7. `SITE_URL` - 11 edges
8. `saveArticle()` - 11 edges
9. `isUuid()` - 11 edges
10. `Neon Serverless Postgres` - 10 edges

## Surprising Connections (you probably didn't know these)
- `AdminPollsPage()` --calls--> `listPolls()`  [EXTRACTED]
  src/app/admin/(dashboard)/polls/page.tsx → src/lib/dal/polls.ts
- `POST()` --calls--> `getDb()`  [EXTRACTED]
  src/app/api/articles/view/route.ts → src/lib/db/index.ts
- `BlockEditorProps` --references--> `ArticleBlock`  [EXTRACTED]
  src/components/admin/BlockEditor.tsx → src/lib/articles/blocks.ts
- `generateStaticParams()` --calls--> `getPublishedArticles()`  [EXTRACTED]
  src/app/(site)/articles/[slug]/page.tsx → src/lib/dal/articles.ts
- `sitemap()` --calls--> `getPublishedArticles()`  [EXTRACTED]
  src/app/sitemap.ts → src/lib/dal/articles.ts

## Import Cycles
- None detected.

## Communities (31 total, 3 thin omitted)

### Community 0 - "db/schema.ts"
Cohesion: 0.08
Nodes (49): EditArticlePage(), NewArticlePage(), AdminArticlesPage(), AdminTagsPage(), POST(), ADR-0001, ArticleForm(), DeleteArticleButton() (+41 more)

### Community 1 - "[slug]/page.tsx"
Cohesion: 0.07
Nodes (39): ADR-0001, GET(), heebo, metadata, robots(), ArticlesPage(), FilteredArticles(), metadata (+31 more)

### Community 2 - "ArticleForm.tsx"
Cohesion: 0.27
Nodes (9): initialState, Field(), FieldProps, inputClass, SlugField(), SlugFieldProps, TagsInput(), TagsInputProps (+1 more)

### Community 3 - "(site)/layout.tsx"
Cohesion: 0.07
Nodes (23): AnalyticsProvider(), Hero(), HeroProps, PlatformButton(), PlatformButtonProps, variantStyles, isActive(), LINKS (+15 more)

### Community 4 - "dependencies"
Cohesion: 0.06
Nodes (34): bcryptjs, drizzle-orm, jose, @neondatabase/serverless, next, dependencies, bcryptjs, drizzle-orm (+26 more)

### Community 5 - "Article"
Cohesion: 0.09
Nodes (30): ArticleFormProps, ArticleCard(), ArticleCardProps, ArticleLeadCard(), ArticleLeadCardProps, ArticleMiniCard(), ArticleMiniCardProps, ArticlesGrid() (+22 more)

### Community 6 - "auth.ts"
Cohesion: 0.10
Nodes (27): metadata, metadata, ALLOWED_CONTENT_TYPES, POST(), initialState, LoginForm(), clientIp(), login() (+19 more)

### Community 7 - "parseVideoUrl.ts"
Cohesion: 0.12
Nodes (25): VideoEditor(), EpisodeCallout(), EpisodeCalloutProps, FRAME_CLASSES, playbackSrc(), VideoFacade(), VideoFacadeProps, PlayCircle() (+17 more)

### Community 8 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 9 - "blocks.ts"
Cohesion: 0.12
Nodes (19): POST(), ADR-0001, ArticleInput, articleInputSchema, blockId, blockSchema, blocksSchema, headingBlockSchema (+11 more)

### Community 10 - "devDependencies"
Cohesion: 0.09
Nodes (23): drizzle-kit, eslint, eslint-config-next, devDependencies, drizzle-kit, eslint, eslint-config-next, @playwright/test (+15 more)

### Community 11 - "actions/polls.ts"
Cohesion: 0.11
Nodes (25): AdminPollsPage(), initialState, NewPollForm(), PollRow(), PollRowProps, STATUS_LABELS, PollSection(), PollWidget() (+17 more)

### Community 12 - "manifest.json"
Cohesion: 0.15
Nodes (12): background_color, description, dir, display, icons, id, lang, name (+4 more)

### Community 13 - "recirculation.ts"
Cohesion: 0.20
Nodes (9): DEFAULT_OPTIONS, PlanOptions, planRecirculation(), publishedTime(), rankTrending(), RecircCurrent, RecircInput, longCurrent (+1 more)

### Community 14 - "BlockItemEditor.tsx"
Cohesion: 0.18
Nodes (7): BLOCK_LABELS, PROVIDER_LABELS, ImageUploadField(), ImageUploadFieldProps, HeadingBlock, ImageBlock, ParagraphBlock

### Community 26 - "Neon"
Cohesion: 0.07
Nodes (26): Architecture: How to Use Neon, Branch configuration, Branch-First Dev Flow, Choosing the Right Skill, Fetching Docs as Markdown, Finding the Right Page, Getting Started with Neon, Getting Started with the Neon CLI (+18 more)

### Community 27 - "BlockEditor.tsx"
Cohesion: 0.33
Nodes (6): ADD_BUTTONS, BlockEditor(), BlockEditorProps, BlockType, createBlock(), BlockItemEditor()

### Community 28 - "ArticleBlock"
Cohesion: 0.38
Nodes (5): BlockItemEditorProps, BlockProps, BlockRenderer(), BlockRendererProps, ArticleBlock

### Community 29 - "Neon Serverless Postgres"
Cohesion: 0.12
Nodes (15): 1. Select the organization and project, 2. Get the connection string, 3. Pick the connection method and driver, 4. Set up the schema, Autoscaling, Branching, Connection Pooling, Instant Restore (+7 more)

### Community 30 - "transliterate.ts"
Cohesion: 0.48
Nodes (5): GERESH_CHARS, GERESH_DIGRAPH_MAP, HEBREW_LETTER_MAP, suggestSlug(), transliterateHebrew()

## Knowledge Gaps
- **181 isolated node(s):** `nextConfig`, `name`, `short_name`, `description`, `id` (+176 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getDb()` connect `db/schema.ts` to `blocks.ts`, `actions/polls.ts`, `[slug]/page.tsx`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Why does `Article` connect `Article` to `db/schema.ts`, `[slug]/page.tsx`, `ArticleForm.tsx`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **Why does `requireAdmin()` connect `db/schema.ts` to `actions/polls.ts`, `auth.ts`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **What connects `nextConfig`, `name`, `short_name` to the rest of the system?**
  _181 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `db/schema.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07945566286215978 - nodes in this community are weakly interconnected._
- **Should `[slug]/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06775956284153005 - nodes in this community are weakly interconnected._
- **Should `(site)/layout.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0746031746031746 - nodes in this community are weakly interconnected._