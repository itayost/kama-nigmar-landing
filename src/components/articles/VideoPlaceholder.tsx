import type { VideoProvider } from "@/lib/articles/blocks";

const PROVIDER_LABELS: Readonly<Record<VideoProvider, string>> = {
  youtube: "סרטון יוטיוב",
  instagram: "סרטון אינסטגרם",
  tiktok: "סרטון טיקטוק",
  spotify: "פרק ספוטיפיי",
};

export function PlayCircle() {
  return (
    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent shadow-[0_0_40px_rgba(46,204,64,0.25)] transition-transform duration-300 group-hover:scale-105">
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-7 w-7 translate-x-[1px] fill-bg-start">
        <path d="M8 5.14v13.72c0 .8.87 1.3 1.56.88l10.54-6.86a1.04 1.04 0 0 0 0-1.76L9.56 4.26A1.04 1.04 0 0 0 8 5.14Z" />
      </svg>
    </span>
  );
}

interface VideoPlaceholderProps {
  readonly provider: VideoProvider;
}

export function VideoPlaceholder({ provider }: VideoPlaceholderProps) {
  return (
    <span className="flex h-full w-full flex-col items-center justify-center gap-3 bg-surface">
      <PlayCircle />
      <span className="text-sm text-text-muted">{PROVIDER_LABELS[provider]}</span>
    </span>
  );
}
