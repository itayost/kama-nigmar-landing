import Image from "next/image";
import { normalizeBlocks, type ArticleBlock, type StoredBlock } from "@/lib/articles/blocks";
import { RichTextView } from "./RichTextView";
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
          <RichTextView runs={block.content} />
        </p>
      );
    case "quote":
      return (
        <blockquote className="my-2 border-s-4 border-accent ps-5">
          <p className="whitespace-pre-line text-[1.3rem] font-medium leading-[1.7] text-white">
            <RichTextView runs={block.content} />
          </p>
          {block.attribution ? (
            <footer className="mt-2 text-sm text-text-muted">
              <cite className="not-italic">{block.attribution}</cite>
            </footer>
          ) : null}
        </blockquote>
      );
    case "list": {
      const ListTag = block.style === "ordered" ? "ol" : "ul";
      return (
        <ListTag
          className={`flex flex-col gap-2 ps-6 text-[1.1rem] leading-[1.85] text-white/[0.88] marker:text-accent ${
            block.style === "ordered" ? "list-decimal" : "list-disc"
          }`}
        >
          {block.items.map((item, index) => (
            <li key={index} className="whitespace-pre-line ps-1">
              <RichTextView runs={item} />
            </li>
          ))}
        </ListTag>
      );
    }
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
  readonly blocks: readonly StoredBlock[];
  // Editorial opener: render the first paragraph block larger and brighter.
  readonly emphasizeOpener?: boolean;
}

export function BlockRenderer({ blocks: stored, emphasizeOpener = false }: BlockRendererProps) {
  const blocks = normalizeBlocks(stored);
  const openerIndex = emphasizeOpener
    ? blocks.findIndex((block) => block.type === "paragraph")
    : -1;

  // Pasted text can carry long runs of non-breaking spaces; let any line break
  // rather than push a phone page sideways.
  return (
    <div className="flex flex-col gap-6 wrap-anywhere">
      {blocks.map((block, index) => (
        <Block key={block.id} block={block} isOpener={index === openerIndex} />
      ))}
    </div>
  );
}
