import { PlayIcon } from "@/components/player/icons";
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
      <PlayIcon className="h-7 w-7 text-bg-start" />
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
