import Image from "next/image";
import { PlatformButton } from "./PlatformButton";

interface HeroProps {
  readonly spotifyUrl: string;
  readonly applePodcastUrl: string;
}

// Slim editorial masthead: the brand stays present but compact, so the day's
// lead story is the visual hero of the homepage.
export function Hero({ spotifyUrl, applePodcastUrl }: HeroProps) {
  return (
    <section
      aria-label="כמה נגמר? — פודקאסט ספורט יומי"
      className="border-b border-surface-border"
    >
      <div className="flex flex-wrap items-center gap-x-5 gap-y-4 py-7">
        <Image
          src="/cover.png"
          alt="כמה נגמר? - עטיפת הפודקאסט"
          width={88}
          height={88}
          loading="eager"
          fetchPriority="high"
          className="h-[88px] w-[88px] shrink-0 rounded-[18px] border-2 border-accent/25 shadow-[0_0_32px_rgba(46,204,64,0.18)]"
        />
        <div>
          <h1 className="text-[clamp(1.6rem,1.2rem+2vw,2.4rem)] font-black leading-[1.05] tracking-tight">
            כמה נגמר
            <span className="text-accent [text-shadow:0_0_30px_rgba(46,204,64,0.5)]">?</span>
          </h1>
          <p className="mt-1 text-[0.95rem] text-text-muted">
            התקציר היומי שלכם · פרק חדש כל בוקר
          </p>
        </div>
        <div className="flex gap-2.5 sm:ms-auto">
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
    </section>
  );
}
