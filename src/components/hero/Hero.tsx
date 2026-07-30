import Image from "next/image";
import { PlatformButton } from "./PlatformButton";

interface HeroProps {
  readonly spotifyUrl: string;
  readonly applePodcastUrl: string;
}

export function Hero({ spotifyUrl, applePodcastUrl }: HeroProps) {
  return (
    <section
      aria-label="כמה נגמר? — פודקאסט ספורט יומי"
      className="grid items-center gap-10 py-11 text-center md:grid-cols-[1.2fr_0.8fr] md:py-18 md:text-start"
    >
      <div className="order-2 flex flex-col items-center md:order-1 md:items-start">
        <span className="flex items-center gap-2 text-sm font-bold text-accent">
          <span aria-hidden="true" className="h-0.5 w-6 rounded-full bg-accent" />
          פודקאסט ספורט יומי
        </span>
        <h1 className="mt-3 text-[clamp(3rem,2rem+5vw,5.5rem)] font-black leading-[1.02] tracking-tight text-balance">
          כמה נגמר
          <span className="text-accent [text-shadow:0_0_40px_rgba(46,204,64,0.5)]">?</span>
        </h1>
        <p className="mt-2 mb-7 max-w-[30ch] text-lg text-text-muted">
          התקציר היומי שלכם. כל מה שקרה אתמול בספורט — בכמה דקות.
        </p>
        <div className="flex flex-wrap justify-center gap-3 md:justify-start">
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
      <div className="order-1 relative flex justify-center md:order-2">
        <div
          aria-hidden="true"
          className="absolute -inset-[10%] bg-[radial-gradient(closest-side,rgba(46,204,64,0.18),transparent_70%)] blur-[10px]"
        />
        <Image
          src="/cover.png"
          alt="כמה נגמר? - עטיפת הפודקאסט"
          width={300}
          height={300}
          loading="eager"
          fetchPriority="high"
          className="relative h-auto w-[220px] rounded-3xl border-2 border-accent/25 shadow-[0_0_60px_rgba(46,204,64,0.15)] md:w-[300px]"
        />
      </div>
    </section>
  );
}
