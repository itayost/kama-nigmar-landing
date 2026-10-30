# UI review: subject taxonomy against the approved mockups

Date: 2026-10-30. Branch: `feat/hardening` (PRs #4 and #5). Reference: the approved mockups
(claude.ai artifact 4f29agY2MPtw4JDb9uznj1, "Subject Map"), read from its saved HTML, not from memory.

## Method

- The mockup's markup for each screen was compared with the built page, element by element.
- Every screen was measured in a browser at 320, 375/390, 768, 1024, 1280/1440 and 1920 px
  against the local copy of production (`npm run dev:local`): horizontal overflow, heading
  order, target sizes, text sizes, layout of each list, and what a phone shows versus a desktop.
- The impeccable detector ran on the source (`impeccable detect src/components src/app`) and on
  the live pages at 390x844 and 1440x900. Each finding is listed below with its disposition.
- The impeccable audit dimensions (accessibility, performance, theming, responsive, integrity)
  were checked, and keyboard focus and reduced motion were tried by hand.

## Screens

| Screen | Mockup decision | Built | Breakpoints checked |
|---|---|---|---|
| Homepage | Lead, one section per subject in admin order (full or compact), roundups strip, no article twice | Matches. Full sections show the subject's top three tags beside the heading on desktop; a phone shows one card then rows; roundups swipe on a phone | 320-1920 |
| Subject page | B's masthead (subject-color rule, description, count, updated date) and newest-story lead; A's sticky tag rail with counts and the list | Matches. Lead without the repeated subject label; rows show "date · subject tag"; roundups in the list show "כולל את <tag>"; the active tag chip scrolls into view on a phone; "עוד כתבות" pages by 12 | 320-1920 |
| Article page | Full-bleed cover, headline on the photo, sheet with rounded top corners scrolling over it, header floats then turns plain navy | Matches. Cover dims and the headline fades with scroll (static under reduced motion); credit on the photo; tags grouped by subject; "עוד ב<subject>" rows on a phone, cards on wider screens; "also in" links | 375, 768, 1280, 1440 |
| Phone menu | Full-page RTL menu growing from the button's corner; subjects with counts and newest headline; roundups; all articles; latest episode | Matches. Dialog with focus trap, Escape, scroll lock; closes on any link, including the current page | 320-1023 (desktop keeps header links) |
| Desktop header | Subject links with color dots, roundups plain, active underline in the subject color | Matches | 1024-1920 |
| Roundups, archive | Not drawn in the mockup; built in the same language (archive header, subject chips) | Consistent with the subject page | 320-1920 |
| Admin board | Inbox first, one column per subject with homepage switch and position, chips with counts, "העברה לכאן" | Matches. All columns on one row on desktop; columns wrap on narrower screens | 768-1920 |
| Admin article form | Tag search with create-in-subject, tags grouped by subject, primary subject, format, cover credit and focal point | Matches | 1024-1440 |

## Fixed during the review

- Homepage: section tags beside the heading; one card then rows on a phone; no subject label on
  cards inside their own subject's section; roundups link plain in the desktop header.
- Subject page: lead without the subject label; "· tag" after the date in rows.
- Article page: "more in" and trending lists became one link per article (row on a phone, card
  from sm up); heading order on the subject and roundups pages (h1, h2, h3).
- Admin: the board kept wrapping its last column at 1440 px; now one row on desktop.
- Accessibility: focus rings and text selection take the nearest subject color; no text under
  11 px (the no-cover wordmark is now decorative and 11.2 px, the player label 11.2 px).
- Performance: the subject page lead loads eagerly at high priority (its LCP); card `sizes`
  match the rendered widths.
- A pasted run of non-breaking spaces pushed article 27 sideways on a phone; article text now
  wraps anywhere.

## Detector findings kept, with reasons

| Finding | Where | Why it stays |
|---|---|---|
| `side-tab` border-bottom 3px | Subject and roundups masthead | The mockup specifies exactly this rule in the subject's color |
| `ai-color-palette` purple text | Olympic sports subject color #c58cff | One of the five approved subject colors |
| `dark-glow` green glows | Brand CTA, player, section mark | Existing brand language, outside this work |
| `radial-spotlight-glow` | Lead card placeholder without a cover | Existing design |
| `text-overflow` | Compact section row | Intentional ellipsis on one-line rows |
| `side-tab` border-s-4 | Article quote block | A blockquote rule, existing design |

## Results

- No horizontal overflow on any page at any width checked.
- One h1 per page and no skipped heading levels in the new pages (article bodies follow their
  authored headings).
- Targets meet WCAG 2.5.8; the smallest text is 11.2 px.
- Both E2E suites pass against the local database (dev: 7, production build: 1).
