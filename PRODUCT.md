# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Israeli sports fans reading in Hebrew, mostly on a phone. A typical visit starts from a single article link shared on WhatsApp or social media, or from the podcast itself. They want to catch up on what happened in sport quickly, in the show's voice.

## Product Purpose

The written companion to "כמה נגמר?", a daily morning sports podcast. The site carries articles, weekly and weekend roundups, and polls, and keeps the latest episode one tap away through a persistent player. Success is a reader who opens a second article in the same visit and comes back the next day.

## Positioning

The podcast's voice in writing: short daily habit, Israeli angle on Israeli and world sport, written by the show's own team rather than a wire desk.

## Operating Context

- One admin manages articles, tags, and polls through the Hebrew RTL admin at `/admin`.
- Episodes live on Spotify and Apple Podcasts; the site embeds and links to them and never hosts audio.
- WhatsApp is the main share and entry channel.
- Articles are addressed by number (`/articles/27`); legacy slugs redirect.

## Capabilities and Constraints

- Article content is ordered blocks (paragraph, heading, quote, list, image, video embed); covers live on Vercel Blob.
- Recirculation already ships: mid-article related, end-of-article related and trending (7-day views), trending strip on the articles index.
- Confirmed taxonomy direction (2026-10-30):
  - **Subjects** (נושאים) are a short list the admin curates. Starting set: כדורגל ישראלי, כדורגל עולמי, כדורסל, ספורט אולימפי, and מוטורספורט once there is content for it.
  - **Tags** (תגיות) are specific entities (leagues, teams, players, competitions). The admin decides which subject each tag belongs to; a new tag waits unassigned until the admin places it. The bare tag "כדורגל" is retired because the subject implies it.
  - An article may carry tags from different subjects. It appears on every subject its tags belong to, and has one **primary subject** that drives its kicker, breadcrumb, and SEO section; the form suggests it from the tags and the admin can override it.
  - **Format** (סוג) is a separate axis from subject; weekly and weekend roundups are a format, not a subject or a tag. A roundup may have no primary subject, in which case its format is its kicker.
  - Each subject gets an indexable hub page; existing `?tag=` links redirect to the matching hub or tag view.
- Undecided: final URL scheme for subject and tag pages; whether one tag may ever belong to two subjects.

## Brand Commitments

- Name "כמה נגמר?" with the question mark as the brand mark; tagline "התקציר היומי שלכם · פרק חדש כל בוקר".
- Podcast cover art at `public/cover.png`; social image at `public/og-wide.jpg`.
- Hebrew, right-to-left, everywhere.

## Evidence on Hand

- 27 published articles as of 2026-10-30, the most recent ones with real cover images.
- No reader testimonials, audience numbers, or press are on hand; do not invent them.

## Product Principles

1. One more article: every surface should offer a credible next read in the same subject.
2. Predictable sections over a pile of tags: readers should know where a story lives before they open it.
3. Daily rhythm: freshness and the morning episode are the reason to come back.
4. The admin stays simple: classification choices are few, curated, and hard to get wrong.

## Accessibility & Inclusion

Israeli accessibility regulations apply (the site already ships the UserWay widget, contrast fixes, and reduced-motion handling). Keep RTL correct, contrast compliant, and motion optional.
