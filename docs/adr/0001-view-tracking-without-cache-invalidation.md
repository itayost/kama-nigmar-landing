# 0001 — View tracking via client beacon and daily rollups, without cache invalidation

Date: 2026-07-31
Status: accepted

## Context

Article pages are statically cached (Next.js Cache Components); every admin mutation
invalidates the `articles` cache tag so published changes appear instantly. Engagement
features need per-article view counts — both cumulative and as a 7-day trending signal —
but a pageview happens orders of magnitude more often than a publish.

## Decision

1. Views are counted by a fire-once client beacon (`POST /api/articles/view`) — never
   during server render, so pages stay statically cacheable.
2. The beacon writes twice: increments the cumulative `articles.views` counter and
   upserts a `(article, day)` row in a daily-views table. "Trending" (הנקראות ביותר)
   is defined as the 7-day sum, so rankings cannot ossify around old hits.
3. View writes NEVER invalidate the cache. Rankings that consume view data
   (`getRelatedArticles`, trending) use `cacheLife("hours")` + the `articles` tag:
   they absorb fresh view counts on an hourly schedule and still update instantly
   on any publish/edit.

## Consequences

- Pageview cost stays one cheap DB write; cache hit rates are untouched by traffic.
- Trending and related rankings lag view activity by up to ~1 hour — accepted; they
  are recommendations, not dashboards.
- The daily-views table grows by (articles × active days) rows — negligible; prune
  rows older than ~30 days if it ever matters.
- Rejected alternatives: `updateTag` per view (destroys static caching under load);
  all-time views for trending (documented ossification failure mode); server-side
  counting during render (forces dynamic pages).
