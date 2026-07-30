import Link from "next/link";
import { PlatformButton } from "@/components/hero/PlatformButton";
import { SOCIAL_LINKS, getCurrentYear } from "@/lib/site";

const SOCIAL_ICONS: ReadonlyArray<{
  key: keyof typeof SOCIAL_LINKS;
  label: string;
  path: string;
}> = [
  {
    key: "instagram",
    label: "אינסטגרם",
    path: "M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.64.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85C2.38 3.92 3.9 2.38 7.15 2.23 8.42 2.17 8.8 2.16 12 2.16ZM12 0C8.74 0 8.33.01 7.05.07 2.7.27.27 2.69.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.36 2.62 6.78 6.98 6.98 1.28.06 1.69.07 4.95.07s3.67-.01 4.95-.07c4.35-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95C23.73 2.7 21.31.27 16.95.07 15.67.01 15.26 0 12 0Zm0 5.84A6.16 6.16 0 1 0 18.16 12 6.16 6.16 0 0 0 12 5.84Zm0 10.15A4 4 0 1 1 16 12a4 4 0 0 1-4 3.99Zm6.4-11.85a1.44 1.44 0 1 0 1.44 1.44 1.44 1.44 0 0 0-1.44-1.44Z",
  },
  {
    key: "tiktok",
    label: "טיקטוק",
    path: "M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07Z",
  },
  {
    key: "youtube",
    label: "יוטיוב",
    path: "M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.19C0 8.07 0 12 0 12s0 3.93.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.88.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.81ZM9.55 15.57V8.43L15.82 12l-6.27 3.57Z",
  },
];

interface SiteFooterProps {
  readonly spotifyUrl: string;
  readonly applePodcastUrl: string;
}

export async function SiteFooter({ spotifyUrl, applePodcastUrl }: SiteFooterProps) {
  const year = await getCurrentYear();
  const activeSocials = SOCIAL_ICONS.filter(({ key }) => SOCIAL_LINKS[key] !== "");

  return (
    <footer className="mt-16 border-t border-surface-border bg-bg-start/60">
      <div className="mx-auto w-full max-w-5xl px-6">
        <div className="grid gap-10 py-12 sm:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="text-xl font-black tracking-tight">
              כמה נגמר<span className="text-accent">?</span>
            </p>
            <p className="mt-3 mb-5 max-w-[34ch] text-sm text-text-muted">
              פודקאסט ספורט יומי ומהיר. כל בוקר — התקציר של מה שקרה אתמול,
              בישראל ובעולם.
            </p>
            <div className="flex flex-wrap gap-2.5">
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
          <nav aria-label="ניווט תחתון">
            <h2 className="mb-3.5 text-sm font-bold">ניווט</h2>
            <ul className="flex flex-col gap-2.5">
              <li>
                <Link href="/" className="text-sm text-text-muted transition-colors hover:text-white">
                  בית
                </Link>
              </li>
              <li>
                <Link
                  href="/articles"
                  className="text-sm text-text-muted transition-colors hover:text-white"
                >
                  כתבות
                </Link>
              </li>
              <li>
                <Link
                  href="/admin"
                  className="text-xs text-text-muted/70 transition-colors hover:text-white"
                >
                  כניסת מנהל
                </Link>
              </li>
            </ul>
          </nav>
          {activeSocials.length > 0 ? (
            <div>
              <h2 className="mb-3.5 text-sm font-bold">עקבו אחרינו</h2>
              <div className="flex gap-2.5">
                {activeSocials.map(({ key, label, path }) => (
                  <a
                    key={key}
                    href={SOCIAL_LINKS[key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex h-9.5 w-9.5 items-center justify-center rounded-lg border border-surface-border bg-surface text-text-muted transition-all hover:border-accent/50 hover:text-white hover:shadow-[0_0_18px_rgba(46,204,64,0.2)]"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
                      <path d={path} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </div>
        <div className="flex items-center justify-between border-t border-surface-border py-4 text-xs text-text-muted">
          <span>כמה נגמר? © {year}</span>
          <span>נבנה על ידי ItayOst</span>
        </div>
      </div>
    </footer>
  );
}
