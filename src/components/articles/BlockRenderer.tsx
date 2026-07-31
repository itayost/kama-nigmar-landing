import Image from "next/image";
import type { ArticleBlock } from "@/lib/articles/blocks";
import { VideoFacade } from "./VideoFacade";

interface BlockProps {
  readonly block: ArticleBlock;
  readonly isOpener: boolean;
}

function Block({ block, isOpener }: BlockProps) {
  switch (block.type) {
    case "paragraph":
      return (
        <p
          className={
            isOpener
              ? "whitespace-pre-line text-[1.22rem] leading-[1.75] text-white"
              : "whitespace-pre-line text-[1.1rem] leading-[1.85] text-white/[0.88]"
          }
        >
          {block.text}
        </p>
      );
    case "heading":
      return block.level === 2 ? (
        <h2 className="mt-4 flex items-center gap-2.5 text-2xl font-extrabold">
          <span
            aria-hidden="true"
            className="h-[1.15em] w-1 rounded-sm bg-accent shadow-[0_0_12px_rgba(46,204,64,0.5)]"
          />
          {block.text}
        </h2>
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
  // Editorial opener: render the first paragraph block larger and brighter.
  readonly emphasizeOpener?: boolean;
}

export function BlockRenderer({ blocks, emphasizeOpener = false }: BlockRendererProps) {
  const openerIndex = emphasizeOpener
    ? blocks.findIndex((block) => block.type === "paragraph")
    : -1;

  return (
    <div className="flex flex-col gap-6">
      {blocks.map((block, index) => (
        <Block key={block.id} block={block} isOpener={index === openerIndex} />
      ))}
    </div>
  );
}
