"use client";

import Image from "next/image";
import { useState } from "react";
import { upload } from "@vercel/blob/client";

interface ImageUploadFieldProps {
  readonly value: string;
  readonly onChange: (url: string) => void;
}

export function ImageUploadField({ value, onChange }: ImageUploadFieldProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setIsUploading(true);
    setError(null);
    try {
      const blob = await upload(`articles/${file.name}`, file, {
        access: "public",
        handleUploadUrl: "/api/admin/blob-upload",
      });
      onChange(blob.url);
    } catch {
      setError("העלאת התמונה נכשלה. נסו שוב");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {value ? (
        <div className="relative aspect-video w-full max-w-sm overflow-hidden rounded-lg border border-surface-border">
          <Image src={value} alt="" fill sizes="384px" className="object-cover" />
        </div>
      ) : null}
      <div className="flex items-center gap-3">
        <label className="cursor-pointer rounded-lg border border-surface-border bg-surface px-4 py-2 text-sm transition-colors hover:border-accent/50">
          {isUploading ? "מעלה..." : value ? "החלפת תמונה" : "העלאת תמונה"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            disabled={isUploading}
            onChange={(event) => handleFile(event.target.files?.[0])}
          />
        </label>
        {value ? (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-sm text-text-muted transition-colors hover:text-red-400"
          >
            הסרת תמונה
          </button>
        ) : null}
      </div>
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
    </div>
  );
}
