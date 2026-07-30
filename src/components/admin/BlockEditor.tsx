"use client";

import type { ArticleBlock } from "@/lib/articles/blocks";
import { BlockItemEditor } from "./BlockItemEditor";

interface BlockEditorProps {
  readonly blocks: readonly ArticleBlock[];
  readonly onChange: (blocks: ArticleBlock[]) => void;
  readonly error?: string;
}

type BlockType = ArticleBlock["type"];

const ADD_BUTTONS: ReadonlyArray<{ type: BlockType; label: string }> = [
  { type: "paragraph", label: "+ פסקה" },
  { type: "heading", label: "+ כותרת" },
  { type: "image", label: "+ תמונה" },
  { type: "video", label: "+ סרטון" },
];

function createBlock(type: BlockType): ArticleBlock {
  const id = crypto.randomUUID();
  switch (type) {
    case "paragraph":
      return { id, type: "paragraph", text: "" };
    case "heading":
      return { id, type: "heading", level: 2, text: "" };
    case "image":
      return { id, type: "image", url: "", alt: "" };
    case "video":
      return { id, type: "video", provider: "youtube", url: "", embedUrl: "" };
  }
}

export function BlockEditor({ blocks, onChange, error }: BlockEditorProps) {
  function updateBlock(index: number, block: ArticleBlock) {
    onChange(blocks.map((existing, i) => (i === index ? block : existing)));
  }

  function removeBlock(index: number) {
    onChange(blocks.filter((_, i) => i !== index));
  }

  function moveBlock(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= blocks.length) return;
    const reordered = [...blocks];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    onChange(reordered);
  }

  return (
    <div className="flex flex-col gap-4">
      <span className="text-sm font-medium">
        תוכן הכתבה<span className="text-accent"> *</span>
      </span>
      {blocks.length === 0 ? (
        <p className="rounded-lg border border-dashed border-surface-border p-6 text-center text-sm text-text-muted">
          הוסיפו בלוקים של תוכן בעזרת הכפתורים למטה
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {blocks.map((block, index) => (
            <BlockItemEditor
              key={block.id}
              block={block}
              onChange={(updated) => updateBlock(index, updated)}
              onRemove={() => removeBlock(index)}
              onMoveUp={() => moveBlock(index, -1)}
              onMoveDown={() => moveBlock(index, 1)}
              canMoveUp={index > 0}
              canMoveDown={index < blocks.length - 1}
            />
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {ADD_BUTTONS.map(({ type, label }) => (
          <button
            key={type}
            type="button"
            onClick={() => onChange([...blocks, createBlock(type)])}
            className="rounded-lg border border-surface-border bg-surface px-4 py-2 text-sm transition-colors hover:border-accent/50"
          >
            {label}
          </button>
        ))}
      </div>
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
    </div>
  );
}
