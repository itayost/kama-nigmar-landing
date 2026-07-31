# Reader-Engagement Patterns Research — כמה נגמר?

Deep research (2026-07-31) into patterns that keep readers on the site and bring them back.
Three research tracks: editorial recirculation, retention/return mechanics, podcast-media + micro-UX.
Already built and excluded from recommendations: related-articles (tags+views+recency), tag pages,
tag chips on articles, RSS feed, static caching, view tracking.

## Framing numbers

- 89% of readers leave after a single article; sports-vertical recirculation averages 12.8%,
  mobile only 9% — and mobile-from-social (this site's main entry) is the worst cell.
  (chartbeat.com/resources/research/recirculation-by-category-device-loyalty/)
- Readers who view 2 pages are 2.75x likelier to return within 7 days (8% → 22%).
  (chartbeat.com/resources/general/increase-return-visits-news-sites/)
- Case studies: +4pts recirculation → +56% pageviews (Aktualne.cz); +6pts → +87% (The Citizen).
  (mediashift.org/2017/12/recirculation-key-metric-news-publishers-2018/)
- Clicks cluster at 400–600px page depth — just below the fold, NOT at the article end;
  closely spaced links perform ~2.5x better; image links get 63% more clicks; plain labels
  ("Related Stories") out-click clever ones.
  (chartbeat.com/resources/research/data-driven-web-design-examining-link-sizes-densities-and-click-throughs/,
  theaudiencers.com/why-recirculation-should-be-one-of-your-kpis-and-how-to-increase-it-with-takeaways-from-the-independent/)

## Tier 0 — channel moves, no code (owner actions)

1. **WhatsApp Channel** for the podcast: daily episode link + 2-3 line Hebrew recap.
   65% of Israelis get news via WhatsApp (IDI 2025, en.idi.org.il/articles/54235); publisher
   channels see ~90% open rates (twipemobile.com WhatsApp strategies). Use UTM links (no native analytics).
2. **Telegram channel**, same copy. 44% of Israelis get news on Telegram; no algorithmic
   filtering; better analytics (TGStat).
3. **Fixed daily publish time**, stated on the site ("פרק חדש כל בוקר ב-07:00") — consistent
   schedule is the core habit-formation lever (twipemobile.com habit-formation guide;
   Reuters Institute daily-news-podcasts study).

## Tier 1 — quick code wins (hours each)

4. **Mid-article related block** at ~400–600px depth: 2-3 items, thumbnails, label "עוד באותו נושא".
   Highest-leverage change — the end-of-article grid sits below where clicks actually happen.
5. **"Most read" strip** ranked by *recent* views (views data already exists). Inline on mobile.
6. **Split the end-of-article grid** into two labeled groups: "עוד באותו נושא" + "הנקראות ביותר"
   (NN/g: labeled groupings beat one mixed pile — nngroup.com/articles/recommendation-guidelines/).
7. **Reading time + freshness**: "X דקות קריאה" (Simpleview: up to +40% engagement, vendor-sourced)
   and "עודכן לפני X" from real timestamps only (searchengineland.com/guide/byline-dates).
8. **Native share button** (Web Share API) — one button, OS sheet, WhatsApp lands on top.
   WhatsApp took 18% of mobile share taps at BuzzFeed (niemanlab.org 2014 chat-apps data).
9. **"מה פספסתם" module**: last 3-5 episodes/articles with dates — lapsed-visitor catch-up.
10. **CLS audit of embeds**: reserved heights on players. Yahoo! Japan's 0.2 CLS fix → +15.1%
    pages/session (web.dev/case-studies/vitals-business-impact). 0.1s mobile speed → −5.4–8.3%
    bounce (Google/Deloitte "Milliseconds Make Millions").

## Tier 2 — medium builds (1-2 days each)

11. **Persistent mini-player** in the root layout (Spotify iFrame API + client state that
    survives navigation). Today the embed unmounts on route change and playback dies —
    a hard ceiling of 1 page-per-session for listening users. Mechanically certain win even
    though vendors publish no numbers. (developer.spotify.com/documentation/embeds)
12. **Daily prediction poll** ("מי מנצח הערב?"): the ONLY pattern with controlled experimental
    evidence — interactive quiz/poll formats held readers ~90s vs ~30s for static content, 3x
    dwell; rotate formats, expect ~7% participation (mediaengagement.org/research/online-polls-and-quizzes/).
    Needs one small vote endpoint + table (same shape as view tracking).
13. **Episode ↔ article cross-links**: "האזינו לפרק על הסיפור הזה" per article and articles-per-episode.
    Reuses tag/date matching.
14. **PWA service worker** (manifest already exists) → add-to-homescreen, and the only push
    path for iOS (31% of Israel). News PWA cases: Infobae 3x pageviews, Forbes +43% sessions
    (progressier.com/pwa-stats — heavy selection effects).
15. **Web push** via OneSignal free tier (≤10k subscribers). Opt-in steady state ~6%; Israel is
    69% Android where browser push works directly (gs.statcounter.com). Hebrew two-step
    soft-ask; hard cap one push/day at episode drop. 43% of alert non-users disabled alerts
    over frequency — restraint is the feature (Reuters DNR 2025).

## Avoid (evidence-backed)

- **Infinite scroll / auto-next-article**: Forbes measured no pageview/time lift and removed it;
  breaks share URLs — fatal when WhatsApp shares are the acquisition channel (digiday.com).
- **Taboola/Outbrain chumboxes**: controlled study — damage source credibility, strongest among
  the most engaged readers; also cannibalize internal module CTR (grady.uga.edu/?p=3630).
- **Entry popups/interstitials**: Google penalty + trust cost on search/social entry.
- **Newsletter (for now)**: needs ESP + RTL templates; skews older than this audience; email
  capture benchmarks are 3-5% anyway. Revisit only if an ESP arrives for other reasons.
- **Live scores**: needs a paid feed and breaks the static model; keep only the freshness signal.
