import Image from "next/image";
import type { ArticleBlock } from "@/lib/articles/blocks";
import { VideoFacade } from "./VideoFacade";

function Block({ block }: { readonly block: ArticleBlock }) {
  switch (block.type) {
    case "paragraph":
      return (
        <p className="whitespace-pre-line text-[1.0625rem] leading-relaxed">
          {block.text}
        </p>
      );
    case "heading":
      return block.level === 2 ? (
        <h2 className="mt-4 text-2xl font-bold">{block.text}</h2>
      ) : (
        <h3 className="mt-2 text-xl font-bold">{block.text}</h3>
      );
    case "image":
      return (
        <figure className="flex flex-col gap-2">
          <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-surface-border">
            <Image
              src={block.url}
              alt={block.alt}
              fill
              sizes="(max-width: 768px) 100vw, 672px"
              className="object-cover"
            />
          </div>
          {block.caption ? (
            <figcaption className="text-center text-sm text-text-muted">
              {block.caption}
            </figcaption>
          ) : null}
        </figure>
      );
    case "video":
      return <VideoFacade block={block} />;
  }
}

interface BlockRendererProps {
  readonly blocks: readonly ArticleBlock[];
}

export function BlockRenderer({ blocks }: BlockRendererProps) {
  return (
    <div className="flex flex-col gap-6">
      {blocks.map((block) => (
        <Block key={block.id} block={block} />
      ))}
    </div>
  );
}
