# Graph Report - .  (2026-08-01)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 505 nodes · 985 edges · 26 communities (23 shown, 3 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.7)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `af200ec2`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7
- Community 8
- Community 9
- Community 10
- Community 11
- Community 12
- Community 13
- Community 14
- Community 16
- Community 17
- Community 18

## God Nodes (most connected - your core abstractions)
1. `getDb()` - 37 edges
2. `requireAdmin()` - 25 edges
3. `Article` - 19 edges
4. `compilerOptions` - 16 edges
5. `ArticleBlock` - 13 edges
6. `parseVideoUrl()` - 13 edges
7. `saveArticle()` - 11 edges
8. `isUuid()` - 11 edges
9. `scripts` - 10 edges
10. `inputClass` - 9 edges

## Surprising Connections (you probably didn't know these)
- `POST()` --calls--> `getDb()`  [EXTRACTED]
  src/app/api/articles/view/route.ts → src/lib/db/index.ts
- `POST()` --calls--> `getDb()`  [EXTRACTED]
  src/app/api/polls/vote/route.ts → src/lib/db/index.ts
- `LoginForm()` --indirect_call--> `login()`  [INFERRED]
  src/components/admin/LoginForm.tsx → src/lib/actions/auth.ts
- `generateMetadata()` --calls--> `getArticleBySlug()`  [EXTRACTED]
  src/app/(site)/articles/[slug]/page.tsx → src/lib/dal/articles.ts
- `ArticleContent()` --calls--> `readingTimeLabel()`  [EXTRACTED]
  src/app/(site)/articles/[slug]/page.tsx → src/lib/articles/reading-time.ts

## Import Cycles
- None detected.

## Communities (26 total, 3 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.08
Nodes (52): EditArticlePage(), NewArticlePage(), AdminArticlesPage(), AdminPollsPage(), AdminTagsPage(), ArticleForm(), DeleteArticleButton(), DeleteArticleButtonProps (+44 more)

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (46): GET(), heebo, metadata, ArticlesPage(), FilteredArticles(), metadata, TrendingStrip(), ArticleContent() (+38 more)

### Community 2 - "Community 2"
Cohesion: 0.07
Nodes (30): metadata, initialState, ADD_BUTTONS, BlockEditor(), BlockEditorProps, BlockType, createBlock(), BLOCK_LABELS (+22 more)

### Community 3 - "Community 3"
Cohesion: 0.07
Nodes (23): AnalyticsProvider(), Hero(), HeroProps, PlatformButton(), PlatformButtonProps, variantStyles, isActive(), LINKS (+15 more)

### Community 4 - "Community 4"
Cohesion: 0.06
Nodes (34): bcryptjs, drizzle-orm, jose, @neondatabase/serverless, next, dependencies, bcryptjs, drizzle-orm (+26 more)

### Community 5 - "Community 5"
Cohesion: 0.11
Nodes (25): ArticleFormProps, ArticleCard(), ArticleCardProps, ArticleLeadCard(), ArticleLeadCardProps, ArticleMiniCard(), ArticleMiniCardProps, ArticlesGrid() (+17 more)

### Community 6 - "Community 6"
Cohesion: 0.11
Nodes (24): metadata, ALLOWED_CONTENT_TYPES, POST(), clientIp(), login(), loginSchema, LoginState, logout() (+16 more)

### Community 7 - "Community 7"
Cohesion: 0.12
Nodes (25): VideoEditor(), EpisodeCallout(), EpisodeCalloutProps, FRAME_CLASSES, playbackSrc(), VideoFacade(), VideoFacadeProps, PlayCircle() (+17 more)

### Community 8 - "Community 8"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 9 - "Community 9"
Cohesion: 0.11
Nodes (21): POST(), ADR-0001, ArticleInput, articleInputSchema, blockId, blockSchema, blocksSchema, headingBlockSchema (+13 more)

### Community 10 - "Community 10"
Cohesion: 0.09
Nodes (23): drizzle-kit, eslint, eslint-config-next, devDependencies, drizzle-kit, eslint, eslint-config-next, @playwright/test (+15 more)

### Community 11 - "Community 11"
Cohesion: 0.13
Nodes (18): POST(), ADR-0001, PollRowProps, PollSection(), PollWidget(), PollWidgetProps, readStoredVote(), storageKey() (+10 more)

### Community 12 - "Community 12"
Cohesion: 0.18
Nodes (10): background_color, description, dir, display, icons, lang, name, short_name (+2 more)

### Community 13 - "Community 13"
Cohesion: 0.31
Nodes (7): israelOffsetMs(), israelPartsFormatter, israelWallClock(), longDateFormatter, shortDateFormatter, toDatetimeLocalIsrael(), WallClockParts

### Community 14 - "Community 14"
Cohesion: 0.48
Nodes (5): GERESH_CHARS, GERESH_DIGRAPH_MAP, HEBREW_LETTER_MAP, suggestSlug(), transliterateHebrew()

## Knowledge Gaps
- **151 isolated node(s):** `eslintConfig`, `nextConfig`, `name`, `version`, `private` (+146 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getDb()` connect `Community 0` to `Community 9`, `Community 11`, `Community 5`, `Community 1`?**
  _High betweenness centrality (0.063) - this node is a cross-community bridge._
- **Why does `Article` connect `Community 5` to `Community 0`, `Community 1`, `Community 2`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **Why does `requireAdmin()` connect `Community 0` to `Community 6`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `nextConfig`, `name` to the rest of the system?**
  _151 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.076103500761035 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.05593561368209256 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.0707070707070707 - nodes in this community are weakly interconnected._