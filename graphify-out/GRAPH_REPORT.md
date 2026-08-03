# Graph Report - kama-nigmar-landing  (2026-08-03)

## Corpus Check
- 123 files · ~122,754 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 577 nodes · 1046 edges · 32 communities (29 shown, 3 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.7)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c9f8c72f`
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
- Podcast Landing Page Design -- "כמה נגמר?"
- BlockItemEditor.tsx
- eslint.config.mjs
- next.config.ts
- postcss.config.mjs
- Neon
- BlockEditor.tsx
- ArticleBlock
- Neon Serverless Postgres
- transliterate.ts
- LoginForm.tsx

## God Nodes (most connected - your core abstractions)
1. `getDb()` - 30 edges
2. `requireAdmin()` - 25 edges
3. `Article` - 18 edges
4. `compilerOptions` - 16 edges
5. `Podcast Landing Page Design -- "כמה נגמר?"` - 13 edges
6. `ArticleBlock` - 13 edges
7. `parseVideoUrl()` - 13 edges
8. `SITE_URL` - 11 edges
9. `saveArticle()` - 11 edges
10. `isUuid()` - 11 edges

## Surprising Connections (you probably didn't know these)
- `POST()` --calls--> `getDb()`  [EXTRACTED]
  src/app/api/articles/view/route.ts → src/lib/db/index.ts
- `BlockEditorProps` --references--> `ArticleBlock`  [EXTRACTED]
  src/components/admin/BlockEditor.tsx → src/lib/articles/blocks.ts
- `VideoEditor()` --calls--> `parseVideoUrl()`  [EXTRACTED]
  src/components/admin/BlockItemEditor.tsx → src/lib/video/parseVideoUrl.ts
- `LoginForm()` --indirect_call--> `login()`  [INFERRED]
  src/components/admin/LoginForm.tsx → src/lib/actions/auth.ts
- `generateStaticParams()` --calls--> `getPublishedArticles()`  [EXTRACTED]
  src/app/(site)/articles/[slug]/page.tsx → src/lib/dal/articles.ts

## Import Cycles
- None detected.

## Communities (32 total, 3 thin omitted)

### Community 0 - "db/schema.ts"
Cohesion: 0.07
Nodes (59): EditArticlePage(), NewArticlePage(), AdminArticlesPage(), AdminPollsPage(), AdminTagsPage(), POST(), ADR-0001, ArticleForm() (+51 more)

### Community 1 - "[slug]/page.tsx"
Cohesion: 0.05
Nodes (49): ADR-0001, GET(), heebo, metadata, robots(), ArticlesPage(), FilteredArticles(), metadata (+41 more)

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
Nodes (29): ArticleFormProps, ArticleCard(), ArticleCardProps, ArticleLeadCard(), ArticleLeadCardProps, ArticleMiniCard(), ArticleMiniCardProps, ArticlesGrid() (+21 more)

### Community 6 - "auth.ts"
Cohesion: 0.11
Nodes (24): metadata, ALLOWED_CONTENT_TYPES, POST(), clientIp(), login(), loginSchema, LoginState, logout() (+16 more)

### Community 7 - "parseVideoUrl.ts"
Cohesion: 0.13
Nodes (24): EpisodeCallout(), EpisodeCalloutProps, FRAME_CLASSES, playbackSrc(), VideoFacade(), VideoFacadeProps, PlayCircle(), PROVIDER_LABELS (+16 more)

### Community 8 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 9 - "blocks.ts"
Cohesion: 0.11
Nodes (20): POST(), ADR-0001, ArticleInput, articleInputSchema, blockId, blockSchema, blocksSchema, headingBlockSchema (+12 more)

### Community 10 - "devDependencies"
Cohesion: 0.09
Nodes (23): drizzle-kit, eslint, eslint-config-next, devDependencies, drizzle-kit, eslint, eslint-config-next, @playwright/test (+15 more)

### Community 11 - "polls/schema.ts"
Cohesion: 0.16
Nodes (15): PollRowProps, STATUS_LABELS, PollSection(), PollWidget(), PollWidgetProps, readStoredVote(), storageKey(), StoredVote (+7 more)

### Community 12 - "manifest.json"
Cohesion: 0.15
Nodes (12): background_color, description, dir, display, icons, id, lang, name (+4 more)

### Community 13 - "Podcast Landing Page Design -- "כמה נגמר?""
Cohesion: 0.09
Nodes (22): Accessibility, Atmosphere, Color Palette, Content Hierarchy, Divider, Environment Variables, Footer, Hero (+14 more)

### Community 14 - "BlockItemEditor.tsx"
Cohesion: 0.18
Nodes (7): BLOCK_LABELS, PROVIDER_LABELS, VideoEditor(), ImageUploadField(), ImageUploadFieldProps, HeadingBlock, ImageBlock

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

### Community 31 - "LoginForm.tsx"
Cohesion: 0.40
Nodes (3): metadata, initialState, LoginForm()

## Knowledge Gaps
- **200 isolated node(s):** `Overview`, `Podcast Identity`, `Color Palette`, `Typography`, `Atmosphere` (+195 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getDb()` connect `db/schema.ts` to `blocks.ts`, `polls/schema.ts`, `[slug]/page.tsx`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._
- **Why does `Article` connect `Article` to `db/schema.ts`, `[slug]/page.tsx`, `ArticleForm.tsx`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **Why does `requireAdmin()` connect `db/schema.ts` to `auth.ts`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **What connects `Overview`, `Podcast Identity`, `Color Palette` to the rest of the system?**
  _200 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `db/schema.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06790123456790123 - nodes in this community are weakly interconnected._
- **Should `[slug]/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.051228070175438595 - nodes in this community are weakly interconnected._
- **Should `(site)/layout.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0746031746031746 - nodes in this community are weakly interconnected._