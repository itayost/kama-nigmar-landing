# Podcast Landing Page Design -- "כמה נגמר?"

## Overview

A single-page landing site for the daily Hebrew sports podcast "כמה נגמר?" (roughly: "What was the score?"). The page provides quick access to listen on Spotify and Apple Podcasts, and embeds the latest episode for immediate playback.

## Podcast Identity

- **Name:** כמה נגמר?
- **Tagline:** פודקאסט ספורט יומי ומהיר | מה קרה אתמול
- **Description:** A short daily sports podcast delivering yesterday's results and key events across Israeli and international sports.
- **Platforms:** Spotify, Apple Podcasts
- **Cover art:** Provided (`/public/cover.png`) -- dark background, multi-sport illustration, bold outlined Hebrew text, energy streaks in green/blue/orange.

## Visual Direction

### Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--color-bg-start` | `#0a1628` | Page background gradient start |
| `--color-bg-end` | `#112240` | Page background gradient end |
| `--color-accent` | `#2ecc40` | Primary accent (buttons, glow, progress) |
| `--color-text` | `#ffffff` | Primary text |
| `--color-text-muted` | `#8899aa` | Secondary/meta text |
| `--color-spotify` | `#1DB954` | Spotify button |
| `--color-apple` | `#872ec4` | Apple Podcasts button |
| `--color-surface` | `rgba(255,255,255,0.05)` | Card/player background |
| `--color-border` | `rgba(255,255,255,0.08)` | Subtle borders |

### Typography

- **Font family:** Heebo (Google Fonts) -- clean Hebrew sans-serif with good weight range
- **Title:** 700-800 weight, `clamp(2rem, 1rem + 4vw, 3.5rem)`
- **Tagline:** 400 weight, `clamp(0.875rem, 0.8rem + 0.3vw, 1.125rem)`
- **Body/meta:** 400 weight, base size

### Atmosphere

- Subtle green radial glow behind the cover art image
- Green gradient divider between hero and player sections
- Cover art has a faint green border and box-shadow glow
- Platform buttons have hover glow effects
- No heavy animation -- the page should feel confident and still, not flashy

## Layout

### Responsive Strategy

Two layout modes with a breakpoint at `768px`:

**Mobile (< 768px) -- Centered Stack (Layout A):**
- Vertically centered single column
- Cover art image (centered, ~180px)
- Title + tagline (centered)
- Platform buttons (row, centered)
- Green gradient divider
- Spotify embed player (full width)
- Footer

**Desktop (>= 768px) -- Split Hero (Layout B):**
- Max width container (~800px, centered)
- Hero section: cover art on the right, title + tagline + platform buttons on the left (RTL layout, so art is on the inline-start side)
- Green gradient divider
- Player section with heading "הפרק האחרון"
- Footer

### Content Hierarchy

1. **Cover art** -- the visual anchor, immediately recognizable
2. **Title + tagline** -- identifies the podcast
3. **Platform buttons** -- primary CTA, links to Spotify and Apple Podcasts
4. **Latest episode embed** -- sample the podcast right here
5. **Footer** -- copyright

## Sections

### Hero

Contains the podcast identity: cover art image, title, tagline, and platform link buttons.

**Cover art image:**
- Source: `/public/cover.png` (the provided illustration)
- Rendered with `next/image` for optimization
- Rounded corners (`border-radius: 20px`)
- Subtle green border (`2px solid` with accent color at reduced opacity)
- Box shadow glow: `0 0 40px rgba(46, 204, 64, 0.15)`
- Mobile: 180px square, centered
- Desktop: 160px square, inline with text

**Title:**
- Text: "כמה נגמר?"
- White, bold, responsive size

**Tagline:**
- Text: "פודקאסט ספורט יומי ומהיר | מה קרה אתמול"
- Muted color, smaller size

**Platform buttons:**
- Two pill-shaped buttons side by side
- Spotify: green background (`#1DB954`), white text, links to the podcast's Spotify page
- Apple Podcasts: purple background (`#872ec4`), white text, links to the podcast's Apple Podcasts page
- Both open in new tabs (`target="_blank" rel="noopener"`)
- Hover: slight scale up + glow shadow matching the button color

### Divider

A horizontal gradient line: `linear-gradient(90deg, transparent, rgba(46,204,64,0.3), transparent)`. Separates hero from player. Full width of the content container.

### Latest Episode Player

**Heading:** "הפרק האחרון" (right-aligned, white, bold)

**Embed:** Spotify embed iframe for the show (not a specific episode). When linked to the show URL, the Spotify embed widget automatically displays the latest episode with playback controls.

- iframe source: `https://open.spotify.com/embed/show/{SHOW_ID}?theme=0` (dark theme)
- Height: ~152px (compact Spotify embed)
- Full width of content container
- Rounded corners, no border
- `allow="encrypted-media"` attribute

The show ID will be configured via an environment variable or a constants file.

### Footer

- Single line: "כמה נגמר? {year}" with the year derived at build time
- Muted text color, small size, centered
- Bottom padding for breathing room

## Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | Next.js (App Router) | User preference, SSG-friendly, room to grow |
| Styling | Tailwind CSS | Utility-first, fast iteration, responsive utilities |
| Fonts | Google Fonts (Heebo) via `next/font` | Optimized loading, no layout shift |
| Images | `next/image` | Auto optimization, lazy loading, responsive sizing |
| Deployment | Vercel (recommended) | Zero-config for Next.js |
| Language | TypeScript (strict) | Project standard |

## Project Structure

```
kama-nigmar-landing/
├── public/
│   └── cover.png              # Podcast cover art
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout (RTL, fonts, meta)
│   │   ├── page.tsx           # Landing page
│   │   └── globals.css        # CSS custom properties, base styles
│   └── components/
│       ├── hero/
│       │   ├── Hero.tsx        # Hero section (art + title + buttons)
│       │   └── PlatformButton.tsx
│       ├── player/
│       │   └── EpisodePlayer.tsx  # Spotify embed wrapper
│       └── ui/
│           └── Divider.tsx     # Green gradient divider
├── tailwind.config.ts
├── next.config.ts
├── tsconfig.json
├── package.json
└── .env.local                 # SPOTIFY_SHOW_ID, platform URLs
```

## SEO and Meta

- `<html lang="he" dir="rtl">`
- Page title: "כמה נגמר? | פודקאסט ספורט יומי"
- Meta description: the podcast tagline
- Open Graph tags with cover art as `og:image`
- Twitter card: `summary_large_image`
- Canonical URL pointing to the production domain

## Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `NEXT_PUBLIC_SPOTIFY_SHOW_URL` | Spotify show page link | `https://open.spotify.com/show/...` |
| `NEXT_PUBLIC_SPOTIFY_SHOW_ID` | Spotify embed show ID | `abc123def456` |
| `NEXT_PUBLIC_APPLE_PODCAST_URL` | Apple Podcasts link | `https://podcasts.apple.com/...` |

All are `NEXT_PUBLIC_` prefixed since they are used client-side and contain no secrets.

## Performance

- Fully static (SSG) -- no server-side rendering needed
- Cover art served via `next/image` with explicit dimensions to prevent CLS
- Heebo font loaded via `next/font/google` with `display: swap`
- Spotify iframe is the only external resource; it loads asynchronously
- Target: LCP < 2.5s, CLS < 0.1

## Accessibility

- Semantic HTML: `<header>`, `<main>`, `<footer>`, `<section>`
- `aria-label` on platform buttons (e.g., "האזינו בספוטיפיי")
- Spotify iframe gets a descriptive `title` attribute
- Sufficient color contrast: white on dark navy exceeds 4.5:1
- Platform buttons are keyboard-focusable with visible focus rings
- `prefers-reduced-motion`: no heavy animations to worry about, but the hover glow transitions respect this media query

## Out of Scope

- Episode archive or list
- Blog or written content
- Social media links
- Contact form
- Analytics (can be added later via Vercel Analytics)
- RSS feed display
