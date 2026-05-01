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
          התקציר היומי שלכם
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
