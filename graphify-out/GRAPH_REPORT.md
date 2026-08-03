# Graph Report - kama-nigmar-landing  (2026-08-03)

## Corpus Check
- 121 files · ~124,622 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 506 nodes · 975 edges · 29 communities (26 shown, 3 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.7)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b02843f3`
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
- polls/schema.ts
- manifest.json
- datetime.ts
- BlockItemEditor.tsx
- eslint.config.mjs
- next.config.ts
- postcss.config.mjs
- recirculation.ts
- VideoFacade.tsx
- ArticleBlock

## God Nodes (most connected - your core abstractions)
1. `getDb()` - 30 edges
2. `requireAdmin()` - 25 edges
3. `Article` - 19 edges
4. `compilerOptions` - 16 edges
5. `ArticleBlock` - 13 edges
6. `parseVideoUrl()` - 13 edges
7. `saveArticle()` - 11 edges
8. `isUuid()` - 11 edges
9. `scripts` - 10 edges
10. `getPublishedArticles()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `AdminTagsPage()` --calls--> `listTagsWithCounts()`  [EXTRACTED]
  src/app/admin/(dashboard)/tags/page.tsx → src/lib/dal/tags.ts
- `LoginForm()` --indirect_call--> `login()`  [INFERRED]
  src/components/admin/LoginForm.tsx → src/lib/actions/auth.ts
- `generateStaticParams()` --calls--> `getPublishedArticles()`  [EXTRACTED]
  src/app/(site)/articles/[slug]/page.tsx → src/lib/dal/articles.ts
- `sitemap()` --calls--> `getPublishedArticles()`  [EXTRACTED]
  src/app/sitemap.ts → src/lib/dal/articles.ts
- `ArticlesPage()` --calls--> `breadcrumbSchema()`  [EXTRACTED]
  src/app/(site)/articles/page.tsx → src/lib/seo/schema.ts

## Import Cycles
- None detected.

## Communities (29 total, 3 thin omitted)

### Community 0 - "db/schema.ts"
Cohesion: 0.07
Nodes (56): EditArticlePage(), NewArticlePage(), AdminArticlesPage(), AdminPollsPage(), POST(), ADR-0001, POST(), ADR-0001 (+48 more)

### Community 1 - "[slug]/page.tsx"
Cohesion: 0.07
Nodes (38): ADR-0001, GET(), heebo, metadata, ArticlesPage(), FilteredArticles(), metadata, TrendingStrip() (+30 more)

### Community 2 - "ArticleForm.tsx"
Cohesion: 0.08
Nodes (26): AdminTagsPage(), metadata, initialState, Field(), FieldProps, inputClass, ImageUploadField(), ImageUploadFieldProps (+18 more)

### Community 3 - "(site)/layout.tsx"
Cohesion: 0.07
Nodes (23): AnalyticsProvider(), Hero(), HeroProps, PlatformButton(), PlatformButtonProps, variantStyles, isActive(), LINKS (+15 more)

### Community 4 - "dependencies"
Cohesion: 0.06
Nodes (34): bcryptjs, drizzle-orm, jose, @neondatabase/serverless, next, dependencies, bcryptjs, drizzle-orm (+26 more)

### Community 5 - "Article"
Cohesion: 0.11
Nodes (22): ArticleFormProps, ArticleCard(), ArticleCardProps, ArticleLeadCard(), ArticleLeadCardProps, ArticleMiniCard(), ArticleMiniCardProps, ArticlesGrid() (+14 more)

### Community 6 - "auth.ts"
Cohesion: 0.11
Nodes (24): metadata, ALLOWED_CONTENT_TYPES, POST(), clientIp(), login(), loginSchema, LoginState, logout() (+16 more)

### Community 7 - "parseVideoUrl.ts"
Cohesion: 0.24
Nodes (14): VideoEditor(), EpisodeCallout(), EpisodeCalloutProps, INSTAGRAM_HOSTS, INSTAGRAM_PATH_PREFIXES, parseInstagram(), parseSpotify(), parseTikTok() (+6 more)

### Community 8 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 9 - "blocks.ts"
Cohesion: 0.15
Nodes (16): ArticleInput, articleInputSchema, blockId, blockSchema, blocksSchema, headingBlockSchema, imageBlockSchema, isBlobUrl() (+8 more)

### Community 10 - "devDependencies"
Cohesion: 0.09
Nodes (23): drizzle-kit, eslint, eslint-config-next, devDependencies, drizzle-kit, eslint, eslint-config-next, @playwright/test (+15 more)

### Community 11 - "polls/schema.ts"
Cohesion: 0.18
Nodes (14): PollRowProps, PollSection(), PollWidget(), PollWidgetProps, readStoredVote(), storageKey(), StoredVote, WidgetState (+6 more)

### Community 12 - "manifest.json"
Cohesion: 0.18
Nodes (10): background_color, description, dir, display, icons, lang, name, short_name (+2 more)

### Community 13 - "datetime.ts"
Cohesion: 0.31
Nodes (8): israelOffsetMs(), israelPartsFormatter, israelWallClock(), longDateFormatter, parseDatetimeLocalIsrael(), shortDateFormatter, toDatetimeLocalIsrael(), WallClockParts

### Community 14 - "BlockItemEditor.tsx"
Cohesion: 0.15
Nodes (10): ADD_BUTTONS, BlockEditor(), BlockType, createBlock(), BLOCK_LABELS, BlockItemEditor(), PROVIDER_LABELS, HeadingBlock (+2 more)

### Community 26 - "recirculation.ts"
Cohesion: 0.20
Nodes (9): DEFAULT_OPTIONS, PlanOptions, planRecirculation(), publishedTime(), rankTrending(), RecircCurrent, RecircInput, longCurrent (+1 more)

### Community 27 - "VideoFacade.tsx"
Cohesion: 0.23
Nodes (11): FRAME_CLASSES, playbackSrc(), VideoFacade(), VideoFacadeProps, PlayCircle(), PROVIDER_LABELS, VideoPlaceholder(), VideoPlaceholderProps (+3 more)

### Community 28 - "ArticleBlock"
Cohesion: 0.32
Nodes (6): BlockEditorProps, BlockItemEditorProps, BlockProps, BlockRenderer(), BlockRendererProps, ArticleBlock

## Knowledge Gaps
- **151 isolated node(s):** `nextConfig`, `ADR-0001`, `eslintConfig`, `name`, `version` (+146 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getDb()` connect `db/schema.ts` to `[slug]/page.tsx`, `polls/schema.ts`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **Why does `Article` connect `Article` to `db/schema.ts`, `[slug]/page.tsx`, `ArticleForm.tsx`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Why does `requireAdmin()` connect `db/schema.ts` to `auth.ts`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **What connects `nextConfig`, `ADR-0001`, `eslintConfig` to the rest of the system?**
  _151 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `db/schema.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07279562542720437 - nodes in this community are weakly interconnected._
- **Should `[slug]/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07078039927404718 - nodes in this community are weakly interconnected._
- **Should `ArticleForm.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08367071524966262 - nodes in this community are weakly interconnected._