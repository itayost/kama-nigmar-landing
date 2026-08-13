# Graph Report - kama-nigmar-landing  (2026-08-11)

## Corpus Check
- 132 files · ~134,804 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 690 nodes · 1243 edges · 49 communities (42 shown, 7 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.7)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `51fe3265`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- getDb
- articles/page.tsx
- ArticleForm.tsx
- (site)/layout.tsx
- dependencies
- Article
- auth.ts
- blocks.ts
- compilerOptions
- parseVideoUrl.ts
- devDependencies
- [slug]/page.tsx
- manifest.json
- Podcast Landing Page Design -- "כמה נגמר?"
- VideoFacade.tsx
- engagement.spec.ts
- eslint.config.mjs
- next.config.ts
- postcss.config.mjs
- Neon
- ArticleBlock
- BlockItemEditor.tsx
- Neon Serverless Postgres
- "כמה נגמר?" Podcast Landing Page -- Implementation Plan
- recirculation.ts
- Articles (כתבות) Website Design — "כמה נגמר?"
- Reader-Engagement Patterns Research — כמה נגמר?
- Domain Docs
- Issue tracker: GitHub
- Agent skills
- 0001 — View tracking via client beacon and daily rollups, without cache invalidation
- README.md
- AGENTS.md
- CONTEXT.md
- triage-labels.md
- Integer Article URLs
- site.ts
- Global Constraints
- polls/schema.ts
- RecirculationSections.tsx
- getPublishedArticles
- ArticleLeadCard.tsx

## God Nodes (most connected - your core abstractions)
1. `getDb()` - 43 edges
2. `requireAdmin()` - 27 edges
3. `Article` - 19 edges
4. `compilerOptions` - 16 edges
5. `ArticleBlock` - 13 edges
6. `SITE_URL` - 13 edges
7. `parseVideoUrl()` - 13 edges
8. `Podcast Landing Page Design -- "כמה נגמר?"` - 13 edges
9. `"כמה נגמר?" Podcast Landing Page -- Implementation Plan` - 12 edges
10. `isUuid()` - 11 edges

## Surprising Connections (you probably didn't know these)
- `LoginForm()` --indirect_call--> `login()`  [INFERRED]
  src/components/admin/LoginForm.tsx → src/lib/actions/auth.ts
- `ArticleLeadCardProps` --references--> `Article`  [EXTRACTED]
  src/components/articles/ArticleLeadCard.tsx → src/lib/db/schema.ts
- `generateStaticParams()` --calls--> `getPublishedArticles()`  [EXTRACTED]
  src/app/(site)/articles/[slug]/page.tsx → src/lib/dal/articles.ts
- `ArticleContent()` --calls--> `readingTimeLabel()`  [EXTRACTED]
  src/app/(site)/articles/[slug]/page.tsx → src/lib/articles/reading-time.ts
- `ArticleContent()` --calls--> `getRecirculation()`  [EXTRACTED]
  src/app/(site)/articles/[slug]/page.tsx → src/lib/dal/articles.ts

## Import Cycles
- None detected.

## Communities (49 total, 7 thin omitted)

### Community 0 - "getDb"
Cohesion: 0.06
Nodes (67): EditArticlePage(), NewArticlePage(), AdminArticlesPage(), AdminPollsPage(), AdminTagsPage(), POST(), ADR-0001, viewPayloadSchema (+59 more)

### Community 1 - "articles/page.tsx"
Cohesion: 0.22
Nodes (10): FilteredArticles(), metadata, TrendingStrip(), TagFilterBar(), TagFilterBarProps, fetchWeeklyViews(), getAllTags(), getRecirculation() (+2 more)

### Community 2 - "ArticleForm.tsx"
Cohesion: 0.10
Nodes (21): metadata, ArticleFormProps, initialState, POLL_STATUS_SUFFIX, Field(), FieldProps, inputClass, ImageUploadField() (+13 more)

### Community 3 - "(site)/layout.tsx"
Cohesion: 0.07
Nodes (23): AnalyticsProvider(), Hero(), HeroProps, PlatformButton(), PlatformButtonProps, variantStyles, isActive(), LINKS (+15 more)

### Community 4 - "dependencies"
Cohesion: 0.06
Nodes (34): bcryptjs, drizzle-orm, jose, @neondatabase/serverless, next, dependencies, bcryptjs, drizzle-orm (+26 more)

### Community 5 - "Article"
Cohesion: 0.24
Nodes (10): ArticleCard(), ArticleCardProps, ArticleMiniCard(), ArticleMiniCardProps, ArticlesGrid(), ArticlesGridProps, MidArticleRelated(), MidArticleRelatedProps (+2 more)

### Community 6 - "auth.ts"
Cohesion: 0.11
Nodes (26): metadata, ALLOWED_CONTENT_TYPES, POST(), clientIp(), login(), loginSchema, LoginState, logout() (+18 more)

### Community 7 - "blocks.ts"
Cohesion: 0.15
Nodes (15): ArticleInput, articleInputSchema, blockId, blockSchema, blocksSchema, headingBlockSchema, imageBlockSchema, isBlobUrl() (+7 more)

### Community 8 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 9 - "parseVideoUrl.ts"
Cohesion: 0.24
Nodes (14): VideoEditor(), EpisodeCallout(), EpisodeCalloutProps, INSTAGRAM_HOSTS, INSTAGRAM_PATH_PREFIXES, parseInstagram(), parseSpotify(), parseTikTok() (+6 more)

### Community 10 - "devDependencies"
Cohesion: 0.09
Nodes (23): drizzle-kit, eslint, eslint-config-next, devDependencies, drizzle-kit, eslint, eslint-config-next, @playwright/test (+15 more)

### Community 11 - "[slug]/page.tsx"
Cohesion: 0.18
Nodes (11): ArticleContent(), generateMetadata(), resolveArticle(), ShareButton(), ShareButtonProps, ViewTracker(), ViewTrackerProps, parseArticleNumber() (+3 more)

### Community 12 - "manifest.json"
Cohesion: 0.15
Nodes (12): background_color, description, dir, display, icons, id, lang, name (+4 more)

### Community 13 - "Podcast Landing Page Design -- "כמה נגמר?""
Cohesion: 0.09
Nodes (22): Accessibility, Atmosphere, Color Palette, Content Hierarchy, Divider, Environment Variables, Footer, Hero (+14 more)

### Community 14 - "VideoFacade.tsx"
Cohesion: 0.19
Nodes (12): FRAME_CLASSES, playbackSrc(), VideoFacade(), VideoFacadeProps, VideoFrameProps, PlayCircle(), PROVIDER_LABELS, VideoPlaceholder() (+4 more)

### Community 26 - "Neon"
Cohesion: 0.07
Nodes (26): Architecture: How to Use Neon, Branch configuration, Branch-First Dev Flow, Choosing the Right Skill, Fetching Docs as Markdown, Finding the Right Page, Getting Started with Neon, Getting Started with the Neon CLI (+18 more)

### Community 27 - "ArticleBlock"
Cohesion: 0.19
Nodes (11): ADD_BUTTONS, BlockEditor(), BlockEditorProps, BlockType, createBlock(), BlockItemEditor(), BlockItemEditorProps, BlockProps (+3 more)

### Community 28 - "BlockItemEditor.tsx"
Cohesion: 0.22
Nodes (5): BLOCK_LABELS, PROVIDER_LABELS, HeadingBlock, ImageBlock, ParagraphBlock

### Community 29 - "Neon Serverless Postgres"
Cohesion: 0.12
Nodes (15): 1. Select the organization and project, 2. Get the connection string, 3. Pick the connection method and driver, 4. Set up the schema, Autoscaling, Branching, Connection Pooling, Instant Restore (+7 more)

### Community 30 - ""כמה נגמר?" Podcast Landing Page -- Implementation Plan"
Cohesion: 0.15
Nodes (12): File Map, Task 10: User Configuration, Task 1: Scaffold Next.js Project, Task 2: Configure Tailwind Theme and Global Styles, Task 3: Root Layout with RTL, Heebo Font, and Metadata, Task 4: PlatformButton Component, Task 5: Divider Component, Task 6: EpisodePlayer Component (+4 more)

### Community 31 - "recirculation.ts"
Cohesion: 0.20
Nodes (9): DEFAULT_OPTIONS, PlanOptions, planRecirculation(), publishedTime(), rankTrending(), RecircCurrent, RecircInput, longCurrent (+1 more)

### Community 32 - "Articles (כתבות) Website Design — "כמה נגמר?""
Cohesion: 0.25
Nodes (7): Articles (כתבות) Website Design — "כמה נגמר?", Decisions, Environment, Known v1 limitations, Overview, Pages, Testing

### Community 33 - "Reader-Engagement Patterns Research — כמה נגמר?"
Cohesion: 0.29
Nodes (6): Avoid (evidence-backed), Framing numbers, Reader-Engagement Patterns Research — כמה נגמר?, Tier 0 — channel moves, no code (owner actions), Tier 1 — quick code wins (hours each), Tier 2 — medium builds (1-2 days each)

### Community 34 - "Domain Docs"
Cohesion: 0.33
Nodes (5): Before exploring, read these, Domain Docs, File structure, Flag ADR conflicts, Use the glossary's vocabulary

### Community 35 - "Issue tracker: GitHub"
Cohesion: 0.33
Nodes (5): Conventions, Issue tracker: GitHub, Pull requests as a triage surface, When a skill says "fetch the relevant ticket", When a skill says "publish to the issue tracker"

### Community 36 - "Agent skills"
Cohesion: 0.40
Nodes (4): Agent skills, Domain docs, Issue tracker, Triage labels

### Community 37 - "0001 — View tracking via client beacon and daily rollups, without cache invalidation"
Cohesion: 0.40
Nodes (4): 0001 — View tracking via client beacon and daily rollups, without cache invalidation, Consequences, Context, Decision

### Community 38 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 42 - "Integer Article URLs"
Cohesion: 0.20
Nodes (9): Admin, Decision, Integer Article URLs, Link and key migration, Out of scope, Problem, Routing, Schema (+1 more)

### Community 43 - "site.ts"
Cohesion: 0.09
Nodes (34): heebo, metadata, robots(), ArticlesPage(), Home(), HomePollSlot(), metadata, metadata (+26 more)

### Community 44 - "Global Constraints"
Cohesion: 0.17
Nodes (11): Global Constraints, Integer Article URLs Implementation Plan, Task 1: Re-key the recirculation planner on `id` instead of `slug`, Task 2: Add the `number` identity column, Task 3: `parseArticleNumber` route-param helper, Task 4: DAL lookups by number, Task 5: Route the article page by number, redirect legacy slugs, Task 6: Switch remaining link builders to `number` (+3 more)

### Community 45 - "polls/schema.ts"
Cohesion: 0.18
Nodes (16): PollRowProps, PollSectionProps, PollWidget(), PollWidgetProps, readStoredVote(), storageKey(), StoredVote, WidgetState (+8 more)

### Community 46 - "RecirculationSections.tsx"
Cohesion: 0.29
Nodes (7): LatestArticlesSection(), RecirculationSections(), RecirculationSectionsProps, SectionHeading(), SectionHeadingProps, RecirculationPlan, getLatestArticles()

### Community 47 - "getPublishedArticles"
Cohesion: 0.36
Nodes (5): GET(), generateStaticParams(), sitemap(), getPublishedArticles(), escapeXml()

### Community 48 - "ArticleLeadCard.tsx"
Cohesion: 0.43
Nodes (4): ArticleLeadCard(), ArticleLeadCardProps, readingTimeLabel(), readingTimeMinutes()

## Knowledge Gaps
- **264 isolated node(s):** `eslintConfig`, `nextConfig`, `name`, `version`, `private` (+259 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getDb()` connect `getDb` to `articles/page.tsx`, `auth.ts`, `[slug]/page.tsx`, `site.ts`, `RecirculationSections.tsx`, `getPublishedArticles`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **Why does `Article` connect `Article` to `getDb`, `articles/page.tsx`, `ArticleForm.tsx`, `site.ts`, `RecirculationSections.tsx`, `ArticleLeadCard.tsx`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Why does `requireAdmin()` connect `getDb` to `auth.ts`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `nextConfig`, `name` to the rest of the system?**
  _264 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `getDb` be split into smaller, more focused modules?**
  _Cohesion score 0.06153846153846154 - nodes in this community are weakly interconnected._
- **Should `ArticleForm.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09885057471264368 - nodes in this community are weakly interconnected._
- **Should `(site)/layout.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0746031746031746 - nodes in this community are weakly interconnected._