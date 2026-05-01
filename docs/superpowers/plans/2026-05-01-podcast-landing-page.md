# "כמה נגמר?" Podcast Landing Page -- Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a responsive single-page landing site for the "כמה נגמר?" Hebrew sports podcast with platform links and an embedded Spotify player.

**Architecture:** Next.js App Router with Tailwind CSS. Fully static (SSG). RTL Hebrew layout. Mobile uses a centered stack, desktop uses a split hero. Spotify embed iframe auto-shows the latest episode.

**Tech Stack:** Next.js 15, TypeScript (strict), Tailwind CSS 4, `next/font` (Heebo), `next/image`

**Spec:** `docs/superpowers/specs/2026-05-01-podcast-landing-page-design.md`

---

## File Map

| File | Responsibility |
|------|---------------|
| `src/app/layout.tsx` | Root layout: RTL, Heebo font, metadata (title, OG, Twitter card) |
| `src/app/page.tsx` | Landing page: composes Hero, Divider, EpisodePlayer, Footer |
| `src/app/globals.css` | Tailwind directives, CSS custom properties (color tokens), base styles |
| `src/components/hero/Hero.tsx` | Cover art + title + tagline + platform buttons; responsive layout |
| `src/components/hero/PlatformButton.tsx` | Pill-shaped external link button with hover glow |
| `src/components/player/EpisodePlayer.tsx` | Spotify embed iframe wrapper |
| `src/components/ui/Divider.tsx` | Green gradient horizontal divider |
| `tailwind.config.ts` | Extend theme with custom colors from spec |
| `.env.local` | Spotify show ID/URL, Apple Podcasts URL |
| `public/cover.png` | Podcast cover art (user-provided asset) |

---

## Task 1: Scaffold Next.js Project

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`

- [ ] **Step 1: Initialize Next.js project**

Run from the project root (`/Users/itayostraich/Documents/GitHub/kama-nigmar-landing`):

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --no-import-alias --yes
```

This scaffolds the project with TypeScript, Tailwind CSS, ESLint, App Router, and `src/` directory.

- [ ] **Step 2: Verify the scaffold runs**

```bash
npm run dev
```

Expected: Dev server starts on `http://localhost:3000` with the default Next.js page.

Stop the dev server after confirming.

- [ ] **Step 3: Copy cover art to public directory**

```bash
cp /Users/itayostraich/Downloads/Gemini_Generated_Image_hhew7khhew7khhew.png public/cover.png
```

- [ ] **Step 4: Create `.env.local` with placeholder values**

Create `.env.local`:

```env
NEXT_PUBLIC_SPOTIFY_SHOW_URL=https://open.spotify.com/show/PLACEHOLDER
NEXT_PUBLIC_SPOTIFY_SHOW_ID=PLACEHOLDER
NEXT_PUBLIC_APPLE_PODCAST_URL=https://podcasts.apple.com/PLACEHOLDER
```

- [ ] **Step 5: Add `.env.local` and `.superpowers/` to `.gitignore`**

Append to the existing `.gitignore`:

```
.env.local
.superpowers/
```

- [ ] **Step 6: Initialize git and commit**

```bash
git init
git add -A
git commit -m "chore: scaffold Next.js project with Tailwind CSS"
```

---

## Task 2: Configure Tailwind Theme and Global Styles

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Extend Tailwind config with custom colors**

Replace the contents of `tailwind.config.ts`:

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "bg-start": "#0a1628",
        "bg-end": "#112240",
        accent: "#2ecc40",
        "text-muted": "#8899aa",
        spotify: "#1DB954",
        apple: "#872ec4",
        surface: "rgba(255,255,255,0.05)",
        "surface-border": "rgba(255,255,255,0.08)",
      },
      fontFamily: {
        heebo: ["var(--font-heebo)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 2: Replace globals.css with base styles**

Replace the contents of `src/app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --color-bg-start: #0a1628;
  --color-bg-end: #112240;
  --color-accent: #2ecc40;
  --color-text: #ffffff;
  --color-text-muted: #8899aa;
  --color-spotify: #1DB954;
  --color-apple: #872ec4;
  --color-surface: rgba(255, 255, 255, 0.05);
  --color-border: rgba(255, 255, 255, 0.08);
}

body {
  background: linear-gradient(135deg, var(--color-bg-start) 0%, var(--color-bg-end) 100%);
  color: var(--color-text);
  min-height: 100dvh;
}
```

- [ ] **Step 3: Verify styles load**

```bash
npm run dev
```

Open `http://localhost:3000`. Expected: page has a dark navy gradient background.

- [ ] **Step 4: Commit**

```bash
git add tailwind.config.ts src/app/globals.css
git commit -m "feat: configure Tailwind theme and global styles"
```

---

## Task 3: Root Layout with RTL, Heebo Font, and Metadata

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Replace layout.tsx with RTL layout and Heebo font**

Replace the contents of `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Heebo } from "next/font/google";
import "./globals.css";

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  display: "swap",
  variable: "--font-heebo",
});

export const metadata: Metadata = {
  title: "כמה נגמר? | פודקאסט ספורט יומי",
  description: "פודקאסט ספורט יומי ומהיר | מה קרה אתמול בעולם הספורט - בארץ ובחו״ל",
  openGraph: {
    title: "כמה נגמר? | פודקאסט ספורט יומי",
    description: "פודקאסט ספורט יומי ומהיר | מה קרה אתמול בעולם הספורט - בארץ ובחו״ל",
    images: [{ url: "/cover.png", width: 1200, height: 1200, alt: "כמה נגמר? פודקאסט" }],
    type: "website",
    locale: "he_IL",
  },
  twitter: {
    card: "summary_large_image",
    title: "כמה נגמר? | פודקאסט ספורט יומי",
    description: "פודקאסט ספורט יומי ומהיר | מה קרה אתמול",
    images: ["/cover.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" className={heebo.variable}>
      <body className="font-heebo antialiased">
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Verify RTL and font**

```bash
npm run dev
```

Open `http://localhost:3000`. Inspect the `<html>` element.
Expected: `lang="he"`, `dir="rtl"`, and the `--font-heebo` CSS variable is set.

- [ ] **Step 3: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat: root layout with RTL, Heebo font, and OG metadata"
```

---

## Task 4: PlatformButton Component

**Files:**
- Create: `src/components/hero/PlatformButton.tsx`

- [ ] **Step 1: Create PlatformButton component**

Create `src/components/hero/PlatformButton.tsx`:

```tsx
interface PlatformButtonProps {
  readonly href: string;
  readonly label: string;
  readonly ariaLabel: string;
  readonly variant: "spotify" | "apple";
}

const variantStyles = {
  spotify:
    "bg-spotify hover:shadow-[0_0_20px_rgba(29,185,84,0.4)] focus-visible:shadow-[0_0_20px_rgba(29,185,84,0.4)]",
  apple:
    "bg-apple hover:shadow-[0_0_20px_rgba(135,46,196,0.4)] focus-visible:shadow-[0_0_20px_rgba(135,46,196,0.4)]",
} as const;

export function PlatformButton({ href, label, ariaLabel, variant }: PlatformButtonProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      className={`
        inline-block rounded-full px-6 py-2.5 text-sm font-semibold text-white
        transition-all duration-200 ease-out
        hover:scale-105 focus-visible:scale-105
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30
        motion-reduce:transition-none motion-reduce:hover:scale-100
        ${variantStyles[variant]}
      `}
    >
      {label}
    </a>
  );
}
```

- [ ] **Step 2: Verify it renders**

Temporarily import and render in `src/app/page.tsx`:

```tsx
import { PlatformButton } from "@/components/hero/PlatformButton";

export default function Home() {
  return (
    <main className="flex min-h-dvh items-center justify-center gap-4">
      <PlatformButton
        href="#"
        label="Spotify"
        ariaLabel="האזינו בספוטיפיי"
        variant="spotify"
      />
      <PlatformButton
        href="#"
        label="Apple Podcasts"
        ariaLabel="האזינו באפל פודקאסטס"
        variant="apple"
      />
    </main>
  );
}
```

Open `http://localhost:3000`. Expected: two pill buttons (green + purple) centered on screen with hover glow.

- [ ] **Step 3: Commit**

```bash
git add src/components/hero/PlatformButton.tsx
git commit -m "feat: PlatformButton component with hover glow"
```

---

## Task 5: Divider Component

**Files:**
- Create: `src/components/ui/Divider.tsx`

- [ ] **Step 1: Create Divider component**

Create `src/components/ui/Divider.tsx`:

```tsx
export function Divider() {
  return (
    <div
      role="separator"
      className="mx-auto my-8 h-px w-full max-w-md"
      style={{
        background:
          "linear-gradient(90deg, transparent, rgba(46, 204, 64, 0.3), transparent)",
      }}
    />
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/Divider.tsx
git commit -m "feat: green gradient Divider component"
```

---

## Task 6: EpisodePlayer Component

**Files:**
- Create: `src/components/player/EpisodePlayer.tsx`

- [ ] **Step 1: Create EpisodePlayer component**

Create `src/components/player/EpisodePlayer.tsx`:

```tsx
interface EpisodePlayerProps {
  readonly showId: string;
}

export function EpisodePlayer({ showId }: EpisodePlayerProps) {
  return (
    <section aria-labelledby="latest-episode-heading" className="w-full">
      <h2
        id="latest-episode-heading"
        className="mb-4 text-lg font-bold text-white"
      >
        הפרק האחרון
      </h2>
      <iframe
        title="נגן הפרק האחרון של כמה נגמר?"
        src={`https://open.spotify.com/embed/show/${showId}?theme=0`}
        width="100%"
        height="152"
        allow="encrypted-media"
        loading="lazy"
        className="rounded-xl border-0"
      />
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/player/EpisodePlayer.tsx
git commit -m "feat: EpisodePlayer Spotify embed component"
```

---

## Task 7: Hero Component

**Files:**
- Create: `src/components/hero/Hero.tsx`

- [ ] **Step 1: Create Hero component**

Create `src/components/hero/Hero.tsx`:

```tsx
import Image from "next/image";
import { PlatformButton } from "./PlatformButton";

interface HeroProps {
  readonly spotifyUrl: string;
  readonly applePodcastUrl: string;
}

export function Hero({ spotifyUrl, applePodcastUrl }: HeroProps) {
  return (
    <header className="flex flex-col items-center gap-6 text-center md:flex-row md:gap-10 md:text-start">
      {/* Cover Art */}
      <div className="relative flex-shrink-0">
        <div className="absolute inset-0 rounded-[20px] bg-accent/10 blur-2xl" />
        <Image
          src="/cover.png"
          alt="כמה נגמר? - עטיפת הפודקאסט"
          width={180}
          height={180}
          priority
          className="relative rounded-[20px] border-2 border-accent/20 shadow-[0_0_40px_rgba(46,204,64,0.15)] md:h-40 md:w-40"
        />
      </div>

      {/* Text + Buttons */}
      <div className="flex flex-col items-center gap-4 md:items-start">
        <h1 className="text-[clamp(2rem,1rem+4vw,3.5rem)] font-extrabold leading-tight">
          כמה נגמר?
        </h1>
        <p className="text-[clamp(0.875rem,0.8rem+0.3vw,1.125rem)] text-text-muted">
          פודקאסט ספורט יומי ומהיר | מה קרה אתמול
        </p>
        <div className="flex gap-3">
          <PlatformButton
            href={spotifyUrl}
            label="Spotify"
            ariaLabel="האזינו בספוטיפיי"
            variant="spotify"
          />
          <PlatformButton
            href={applePodcastUrl}
            label="Apple Podcasts"
            ariaLabel="האזינו באפל פודקאסטס"
            variant="apple"
          />
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/hero/Hero.tsx
git commit -m "feat: Hero component with cover art, title, and platform buttons"
```

---

## Task 8: Compose Landing Page

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Replace page.tsx with the full landing page composition**

Replace the contents of `src/app/page.tsx`:

```tsx
import { Hero } from "@/components/hero/Hero";
import { Divider } from "@/components/ui/Divider";
import { EpisodePlayer } from "@/components/player/EpisodePlayer";

const spotifyShowUrl = process.env.NEXT_PUBLIC_SPOTIFY_SHOW_URL ?? "#";
const spotifyShowId = process.env.NEXT_PUBLIC_SPOTIFY_SHOW_ID ?? "";
const applePodcastUrl = process.env.NEXT_PUBLIC_APPLE_PODCAST_URL ?? "#";

export default function Home() {
  const year = new Date().getFullYear();

  return (
    <div className="flex min-h-dvh flex-col items-center px-6 py-12 md:py-20">
      <main className="flex w-full max-w-3xl flex-col items-center gap-2">
        <Hero spotifyUrl={spotifyShowUrl} applePodcastUrl={applePodcastUrl} />
        <Divider />
        <EpisodePlayer showId={spotifyShowId} />
      </main>
      <footer className="mt-auto pt-12 text-center text-sm text-text-muted">
        כמה נגמר? {year}
      </footer>
    </div>
  );
}
```

- [ ] **Step 2: Verify the full page**

```bash
npm run dev
```

Open `http://localhost:3000`.

Expected:
- Dark gradient background
- Cover art with green glow
- Title "כמה נגמר?" and tagline in Hebrew, right-aligned on desktop
- Two platform buttons (green + purple)
- Green gradient divider
- Spotify embed player (will show placeholder until a real show ID is set)
- Footer with year

Resize to mobile width (<768px). Expected: everything stacks vertically and centers.

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: compose landing page with Hero, Divider, Player, and Footer"
```

---

## Task 9: Type Check and Build Verification

**Files:** None (verification only)

- [ ] **Step 1: Run type check**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 2: Run production build**

```bash
npm run build
```

Expected: Build succeeds. The page is statically generated.

- [ ] **Step 3: Run production server and verify**

```bash
npm run start
```

Open `http://localhost:3000`. Verify all elements render correctly.

- [ ] **Step 4: Commit any fixes (if needed) and tag**

If any fixes were required:

```bash
git add -A
git commit -m "fix: resolve build issues"
```

---

## Task 10: User Configuration

**Files:**
- Modify: `.env.local`

This task is done by the user, not the agent. Include it for completeness.

- [ ] **Step 1: Get Spotify show ID**

Go to the podcast's Spotify page. The URL looks like `https://open.spotify.com/show/ABC123`. The show ID is `ABC123`.

- [ ] **Step 2: Get Apple Podcasts URL**

Go to Apple Podcasts and find the podcast. Copy the full URL.

- [ ] **Step 3: Update `.env.local`**

Replace the placeholder values:

```env
NEXT_PUBLIC_SPOTIFY_SHOW_URL=https://open.spotify.com/show/YOUR_SHOW_ID
NEXT_PUBLIC_SPOTIFY_SHOW_ID=YOUR_SHOW_ID
NEXT_PUBLIC_APPLE_PODCAST_URL=https://podcasts.apple.com/il/podcast/YOUR_PODCAST_PATH
```

- [ ] **Step 4: Restart dev server and verify links and player work**

```bash
npm run dev
```

Open `http://localhost:3000`. Click both platform buttons -- they should open the correct pages. The Spotify player should load and show the latest episode.
