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
  {
    key: "whatsapp",
    label: "ערוץ הוואטסאפ",
    path: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z",
  },
  {
    key: "telegram",
    label: "ערוץ הטלגרם",
    path: "M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z",
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
                  href="/terms"
                  className="text-sm text-text-muted transition-colors hover:text-white"
                >
                  תנאי שימוש
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-text-muted transition-colors hover:text-white"
                >
                  מדיניות פרטיות
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
