"use client";

import Image from "next/image";
import { useState } from "react";
import type {
  ArticleBlock,
  HeadingBlock,
  ImageBlock,
  ParagraphBlock,
  VideoBlock,
} from "@/lib/articles/blocks";
import { parseVideoUrl } from "@/lib/video/parseVideoUrl";
import { inputClass } from "./Field";
import { ImageUploadField } from "./ImageUploadField";

const BLOCK_LABELS: Readonly<Record<ArticleBlock["type"], string>> = {
  paragraph: "פסקה",
  heading: "כותרת",
  image: "תמונה",
  video: "סרטון",
};

const PROVIDER_LABELS: Readonly<Record<VideoBlock["provider"], string>> = {
  youtube: "יוטיוב",
  instagram: "אינסטגרם",
  tiktok: "טיקטוק",
  spotify: "ספוטיפיי",
};

interface BlockItemEditorProps {
  readonly block: ArticleBlock;
  readonly onChange: (block: ArticleBlock) => void;
  readonly onRemove: () => void;
  readonly onMoveUp: () => void;
  readonly onMoveDown: () => void;
  readonly canMoveUp: boolean;
  readonly canMoveDown: boolean;
}

function ParagraphEditor({
  block,
  onChange,
}: {
  readonly block: ParagraphBlock;
  readonly onChange: (block: ArticleBlock) => void;
}) {
  return (
    <textarea
      value={block.text}
      onChange={(event) => onChange({ ...block, text: event.target.value })}
      placeholder="כתבו כאן את הפסקה..."
      rows={4}
      className={inputClass}
    />
  );
}

function HeadingEditor({
  block,
  onChange,
}: {
  readonly block: HeadingBlock;
  readonly onChange: (block: ArticleBlock) => void;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <input
        type="text"
        value={block.text}
        onChange={(event) => onChange({ ...block, text: event.target.value })}
        placeholder="טקסט הכותרת"
        className={inputClass}
      />
      <select
        value={block.level}
        onChange={(event) =>
          onChange({ ...block, level: Number(event.target.value) === 3 ? 3 : 2 })
        }
        className={`${inputClass} sm:w-40`}
      >
        <option value={2}>כותרת גדולה</option>
        <option value={3}>כותרת קטנה</option>
      </select>
    </div>
  );
}

function ImageEditor({
  block,
  onChange,
}: {
  readonly block: ImageBlock;
  readonly onChange: (block: ArticleBlock) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <ImageUploadField
        value={block.url}
        onChange={(url) => onChange({ ...block, url })}
      />
      <input
        type="text"
        value={block.alt}
        onChange={(event) => onChange({ ...block, alt: event.target.value })}
        placeholder="טקסט חלופי (תיאור קצר של התמונה)"
        className={inputClass}
      />
      <input
        type="text"
        value={block.caption ?? ""}
        onChange={(event) => onChange({ ...block, caption: event.target.value })}
        placeholder="כיתוב מתחת לתמונה (לא חובה)"
        className={inputClass}
      />
    </div>
  );
}

function VideoEditor({
  block,
  onChange,
}: {
  readonly block: VideoBlock;
  readonly onChange: (block: ArticleBlock) => void;
}) {
  const [error, setError] = useState<string | null>(null);

  function handleUrlBlur(url: string) {
    if (url.trim() === "") {
      setError(null);
      return;
    }
    const parsed = parseVideoUrl(url);
    if (!parsed) {
      setError(
        "הקישור לא נתמך — הדביקו קישור מלא מיוטיוב, אינסטגרם, טיקטוק או ספוטיפיי",
      );
      return;
    }
    setError(null);
    onChange({ id: block.id, type: "video", url, ...parsed });
  }

  const isRecognized = block.embedUrl !== "" && !error;

  return (
    <div className="flex flex-col gap-2">
      <input
        type="url"
        dir="ltr"
        value={block.url}
        onChange={(event) => onChange({ ...block, url: event.target.value })}
        onBlur={(event) => handleUrlBlur(event.target.value)}
        placeholder="https://www.youtube.com/watch?v=..."
        className={`${inputClass} text-left`}
      />
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      {isRecognized ? (
        <div className="flex items-center gap-3">
          {block.thumbnailUrl ? (
            <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-md border border-surface-border">
              <Image
                src={block.thumbnailUrl}
                alt=""
                fill
                sizes="112px"
                className="object-cover"
              />
            </div>
          ) : null}
          <p className="text-sm text-accent">
            זוהה סרטון {PROVIDER_LABELS[block.provider]} ✓
          </p>
        </div>
      ) : null}
    </div>
  );
}

export function BlockItemEditor({
  block,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: BlockItemEditorProps) {
  const moveButtonClass =
    "rounded-md border border-surface-border px-2 py-1 text-xs text-text-muted transition-colors hover:border-accent/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-30";

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-surface-border bg-surface p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-text-muted">
          {BLOCK_LABELS[block.type]}
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={!canMoveUp}
            aria-label="העברת הבלוק למעלה"
            className={moveButtonClass}
          >
            ↑
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={!canMoveDown}
            aria-label="העברת הבלוק למטה"
            className={moveButtonClass}
          >
            ↓
          </button>
          <button
            type="button"
            onClick={onRemove}
            aria-label="הסרת הבלוק"
            className="rounded-md border border-surface-border px-2 py-1 text-xs text-text-muted transition-colors hover:border-red-400/50 hover:text-red-400"
          >
            ✕
          </button>
        </div>
      </div>
      {block.type === "paragraph" ? (
        <ParagraphEditor block={block} onChange={onChange} />
      ) : null}
      {block.type === "heading" ? (
        <HeadingEditor block={block} onChange={onChange} />
      ) : null}
      {block.type === "image" ? <ImageEditor block={block} onChange={onChange} /> : null}
      {block.type === "video" ? <VideoEditor block={block} onChange={onChange} /> : null}
    </div>
  );
}
