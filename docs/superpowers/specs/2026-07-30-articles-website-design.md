# Articles (כתבות) Website Design — "כמה נגמר?"

## Overview

Expansion of the single-page podcast landing site into a small website: the homepage keeps
the hero and latest-episode player and adds recent כתבות; a non-technical admin manages
articles through a Hebrew RTL admin at `/admin`.

## Decisions

- Infrastructure: Vercel-native — Neon Postgres (Marketplace, resource `kama-nigmar-db`)
  via Drizzle ORM, Vercel Blob (store `kama-nigmar-media`) for images.
- Auth: single admin. `ADMIN_EMAIL` + `ADMIN_PASSWORD_HASH` (bcryptjs cost 12) in env,
  jose HS256 session JWT in an httpOnly cookie. Optimistic redirect in `src/proxy.ts`,
  real check via `requireAdmin()` inside every admin page and Server Action.
- Content model: ordered JSON blocks — paragraph, heading (h2/h3), image, video.
- Videos: link-based click-to-play facades for YouTube (real thumbnail), Instagram,
  TikTok, and Spotify episodes (branded placeholder cards). Derived embed fields are
  recomputed server-side from the pasted URL; client values are preview-only.
- Slugs: English, auto-transliterated from the Hebrew title (`suggestSlug`), editable.
- Visibility is governed solely by `status = 'published'`; `publishedAt` is display/sort
  only and is set automatically on first publish.
- Caching: `cacheComponents: true`; public reads use `'use cache'` + `cacheLife('max')`
  + `cacheTag('articles')` / `` cacheTag(`article-${slug}`) ``; admin mutations call
  `updateTag(...)` so published changes appear instantly without redeploy.

## Pages

- `/` — hero + episode player + latest 4 published articles (hidden when none).
- `/articles` — all published articles, tag filter via `?tag=` (chips, RSC links).
- `/articles/[slug]` — article page rendered from blocks; Suspense-wrapped content
  (required by Cache Components for unknown dynamic params); OG metadata from cover.
- `/admin` — list with status badges, publish toggle, edit, delete-with-confirm.
- `/admin/articles/new`, `/admin/articles/[id]/edit` — shared `ArticleForm` with
  block editor (add / move up / move down / remove; no drag-and-drop).
- `/admin/login` — email + password, in-memory rate limit (5 failures → 10 min).

## Environment

`DATABASE_URL` (Neon), `BLOB_READ_WRITE_TOKEN` (Blob), `AUTH_SECRET`, `ADMIN_EMAIL`,
`ADMIN_PASSWORD_HASH`. See `.env.example`. IMPORTANT: in `.env.local` every `$` in the
bcrypt hash must be escaped as `\$` — Next.js expands `$VAR` references in env files
(all quote styles). In the Vercel dashboard the hash is stored raw.

## Testing

- Vitest: `parseVideoUrl`, `transliterate`, block/article zod schemas (58 tests).
- Playwright (`e2e/admin-flow.spec.ts`, port 3117): wrong-password rejection; full
  login → create → publish → public view → delete → 404 flow. Requires
  `E2E_ADMIN_EMAIL` / `E2E_ADMIN_PASSWORD`.

## Known v1 limitations

- Instagram/TikTok embeds can be login-gated or change without notice; the facade
  contains the blast radius.
- No draft preview, no slug-change redirects, no pagination on `/articles`.
- Login rate limiting is per serverless instance.
