"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { saveArticle, type ArticleFormState } from "@/lib/actions/articles";
import type { ArticleBlock } from "@/lib/articles/blocks";
import { toDatetimeLocalIsrael } from "@/lib/datetime";
import type { Article } from "@/lib/db/schema";
import { suggestSlug } from "@/lib/slug/transliterate";
import { BlockEditor } from "./BlockEditor";
import { Field, inputClass } from "./Field";
import { ImageUploadField } from "./ImageUploadField";
import { SlugField } from "./SlugField";
import { TagsInput } from "./TagsInput";

const initialState: ArticleFormState = { errors: {} };

interface ArticleFormProps {
  readonly article?: Article;
  readonly tagSuggestions?: readonly string[];
}

// Every field is controlled: React 19 resets uncontrolled inputs to their
// defaultValue after a form action completes, which would wipe the admin's
// input whenever the server returns a validation error.
export function ArticleForm({ article, tagSuggestions }: ArticleFormProps) {
  const [state, formAction, isPending] = useActionState(saveArticle, initialState);
  const [title, setTitle] = useState(article?.title ?? "");
  const [subtitle, setSubtitle] = useState(article?.subtitle ?? "");
  const [authorName, setAuthorName] = useState(article?.authorName ?? "");
  const [status, setStatus] = useState<"draft" | "published">(
    article?.status ?? "draft",
  );
  const [publishedAtLocal, setPublishedAtLocal] = useState(() =>
    toDatetimeLocalIsrael(article?.publishedAt),
  );
  const [slug, setSlug] = useState(article?.slug ?? "");
  const [isSlugTouched, setIsSlugTouched] = useState(Boolean(article));
  const [tags, setTags] = useState<string[]>(article?.tags ?? []);
  const [coverImageUrl, setCoverImageUrl] = useState(article?.coverImageUrl ?? "");
  const [blocks, setBlocks] = useState<ArticleBlock[]>(article?.content ?? []);

  const hasErrors = Object.keys(state.errors).length > 0;

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!isSlugTouched) {
      setSlug(suggestSlug(value));
    }
  }

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {article ? <input type="hidden" name="id" value={article.id} /> : null}
      <input type="hidden" name="content" value={JSON.stringify(blocks)} />
      <input type="hidden" name="tags" value={tags.join(",")} />
      <input type="hidden" name="coverImageUrl" value={coverImageUrl} />

      {hasErrors ? (
        <p className="rounded-lg border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm text-red-400">
          {state.errors.form ?? "יש שגיאות בטופס — בדקו את השדות המסומנים"}
        </p>
      ) : null}

      <Field label="כותרת" required error={state.errors.title}>
        <input
          type="text"
          name="title"
          value={title}
          onChange={(event) => handleTitleChange(event.target.value)}
          placeholder="כותרת הכתבה"
          className={inputClass}
        />
      </Field>

      <Field label="כותרת משנה" error={state.errors.subtitle}>
        <input
          type="text"
          name="subtitle"
          value={subtitle}
          onChange={(event) => setSubtitle(event.target.value)}
          placeholder="משפט קצר שמסכם את הכתבה (לא חובה)"
          className={inputClass}
        />
      </Field>

      <Field label="תמונת שער" group error={state.errors.coverImageUrl}>
        <ImageUploadField value={coverImageUrl} onChange={setCoverImageUrl} />
      </Field>

      <Field label="שם הכותב" required error={state.errors.authorName}>
        <input
          type="text"
          name="authorName"
          value={authorName}
          onChange={(event) => setAuthorName(event.target.value)}
          placeholder="מי כתב את הכתבה?"
          className={inputClass}
        />
      </Field>

      <Field label="תגיות" group error={state.errors.tags}>
        <TagsInput value={tags} onChange={setTags} suggestions={tagSuggestions} />
      </Field>

      <SlugField
        value={slug}
        onChange={(value) => {
          setIsSlugTouched(true);
          setSlug(value);
        }}
        error={state.errors.slug}
        showPublishedWarning={article?.status === "published"}
      />

      <Field label="סטטוס" group error={state.errors.status}>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="status"
              value="draft"
              checked={status === "draft"}
              onChange={() => setStatus("draft")}
              className="accent-accent"
            />
            טיוטה
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="status"
              value="published"
              checked={status === "published"}
              onChange={() => setStatus("published")}
              className="accent-accent"
            />
            פורסם
          </label>
        </div>
      </Field>

      <Field
        label="תאריך פרסום (שעון ישראל)"
        error={state.errors.publishedAt}
        hint="אם משאירים ריק, התאריך ייקבע אוטומטית בפרסום הראשון"
      >
        <input
          type="datetime-local"
          name="publishedAt"
          value={publishedAtLocal}
          onChange={(event) => setPublishedAtLocal(event.target.value)}
          className={`${inputClass} max-w-xs`}
        />
      </Field>

      <BlockEditor blocks={blocks} onChange={setBlocks} error={state.errors.content} />

      <div className="flex items-center gap-3 border-t border-surface-border pt-6">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-accent px-6 py-2.5 font-medium text-bg-start transition-all hover:shadow-[0_0_20px_rgba(46,204,64,0.4)] disabled:opacity-50"
        >
          {isPending ? "שומר..." : "שמירה"}
        </button>
        <Link
          href="/admin"
          className="rounded-lg border border-surface-border px-6 py-2.5 text-sm text-text-muted transition-colors hover:text-white"
        >
          ביטול
        </Link>
      </div>
    </form>
  );
}
