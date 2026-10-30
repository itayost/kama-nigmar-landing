# 0002 — Subjects, subject-owned tags and formats, rolled out additively

Date: 2026-10-30
Status: accepted

## Context

Articles carried one flat `text[]` of tags. That list mixed sports, leagues, players,
a format ("סוף שבוע") and a concept (VAR), and the first tag silently became the
article's section: the label above the headline, the card badge and the JSON-LD
`articleSection`. Nine of nineteen tags were used once. The site needs sections
readers can navigate (homepage blocks, subject pages), and the admin needs control
over where each tag belongs.

## Decision

1. Three separate axes per article: one optional **primary subject**
   (`articles.primary_subject_id`), any number of **tags** in display order
   (`article_tags`, replacing `articles.tags`), and one **format**
   (`articles.format`: story, roundup, guide).
2. Every tag belongs to at most one subject (`tags.subject_id`), set by the admin; a
   tag without one waits in the inbox. An article appears in its primary subject and
   in every subject its tags belong to.
3. Schema changes ship as generated migrations (`npm run db:generate`,
   `npm run db:migrate`) instead of `db:push`. `0000_baseline` is the schema production
   already had; `db:migrate` records it as applied on a database built with push, then
   runs the rest in one transaction over the Neon WebSocket driver.
4. The rollout is additive. Migration `0001` only adds tables, columns and indexes, so
   it is safe to apply while the current code is live. The backfill
   (`npm run db:backfill-taxonomy`) reads `articles.tags`, never changes it, and runs at
   cutover, right before the code that reads the new structures ships.
6. After cutover the site reads only `article_tags`. `articles.tags` stays as a
   rollback mirror: every admin save rewrites it in tag order, and nothing public
   selects it. It is not dropped.
7. Old archive filter links (`/articles?tag=<name>`) answer with a 308 from the proxy:
   a tag that became a subject goes to `/topics/<slug>`, the weekend tag to
   `/roundups`, a kept tag (renamed per the backfill mapping) to its subject page
   filtered by it, and a retired or unfiled tag to `/articles`.
5. Every command that writes requires `--confirm-host=<host>`, because `.env.local`
   points at production.

## Consequences

- Renaming a tag no longer rewrites article arrays, and tag order is explicit
  (`article_tags.position`), so a rename can no longer change an article's label.
- Until cutover the old admin keeps writing `articles.tags`; re-running the backfill
  (with `--replace`) before cutover picks those edits up. After cutover it must not
  be re-run, since it would overwrite tag edits made in the new admin.
- `db:push` is removed from the scripts: mixing push with migrations creates tables
  outside the migration history and breaks the next `db:migrate`.
- Rolling back means deploying the previous code: it reads `articles.tags`, which the
  mirror keeps current.
- Open: one subject per tag. "ליגיונרים" is the only current tag that would want two;
  it starts in the inbox.
