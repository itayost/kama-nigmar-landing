"use client";

import Image from "next/image";
import { useState } from "react";
import type { VideoBlock, VideoProvider } from "@/lib/articles/blocks";
import { PlayCircle, VideoPlaceholder } from "./VideoPlaceholder";

// Portrait frame for social clips, widescreen for YouTube, compact bar for Spotify.
const FRAME_CLASSES: Readonly<Record<VideoProvider, string>> = {
  youtube: "aspect-video w-full",
  instagram: "mx-auto aspect-[9/16] w-full max-w-[360px]",
  tiktok: "mx-auto aspect-[9/16] w-full max-w-[360px]",
  spotify: "h-[152px] w-full",
};

function playbackSrc(block: VideoBlock): string {
  if (block.provider === "youtube") {
    return `${block.embedUrl}?autoplay=1`;
  }
  return block.embedUrl;
}

interface VideoFrameProps {
  readonly src: string;
  readonly title: string;
  readonly className: string;
}

function VideoFrame({ src, title, className }: VideoFrameProps) {
  return (
    <div className={`${className} overflow-hidden rounded-xl`}>
      <iframe
        src={src}
        title={title}
        allow="autoplay; encrypted-media; fullscreen; picture-in-picture; clipboard-write"
        allowFullScreen
        loading="lazy"
        className="h-full w-full border-0"
      />
    </div>
  );
}

interface VideoFacadeProps {
  readonly block: VideoBlock;
}

export function VideoFacade({ block }: VideoFacadeProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const frameClass = FRAME_CLASSES[block.provider];

  // Spotify gets no facade. It has no thumbnail to show behind one, and its
  // embed cannot autoplay the way YouTube can, so the facade click buys
  // nothing and leaves the reader pressing two play buttons in a row. The
  // compact player carries its own artwork, title and control.
  if (block.provider === "spotify") {
    return (
      <VideoFrame src={block.embedUrl} title="נגן פרק ספוטיפיי" className={frameClass} />
    );
  }

  if (isPlaying) {
    return (
      <VideoFrame src={playbackSrc(block)} title="נגן וידאו" className={frameClass} />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsPlaying(true)}
      aria-label="נגן סרטון"
      className={`${frameClass} group relative block cursor-pointer overflow-hidden rounded-xl border border-surface-border focus-visible:border-accent focus-visible:outline-none`}
    >
      {block.thumbnailUrl ? (
        <>
          <Image
            src={block.thumbnailUrl}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 672px"
            className="object-cover"
          />
          <span className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors duration-300 group-hover:bg-black/20">
            <PlayCircle />
          </span>
        </>
      ) : (
        <VideoPlaceholder provider={block.provider} />
      )}
    </button>
  );
}
