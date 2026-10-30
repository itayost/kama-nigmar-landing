"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { saveArticle, type ArticleFormState } from "@/lib/actions/articles";
import { normalizeBlocks, type ArticleBlock } from "@/lib/articles/blocks";
import { toDatetimeLocalIsrael } from "@/lib/datetime";
import type { PollChoice } from "@/lib/dal/polls";
import type { AdminTaxonomy, TaxonomyTag } from "@/lib/dal/taxonomy-admin";
import type { Article } from "@/lib/db/schema";
import type { ArticleFormat } from "@/lib/taxonomy/format";
import { suggestPrimarySubject } from "@/lib/taxonomy/suggest";
import { BlockEditor } from "./BlockEditor";
import { CoverFocusField, type CoverFocus } from "./CoverFocusField";
import { Field, inputClass } from "./Field";
import { ImageUploadField } from "./ImageUploadField";
import { SubjectChoice } from "./taxonomy/SubjectChoice";
import { TagPicker } from "./taxonomy/TagPicker";

const initialState: ArticleFormState = { errors: {} };

interface ArticleFormProps {
  readonly article?: Article;
  readonly tagIds?: readonly string[];
  readonly taxonomy: AdminTaxonomy;
  readonly pollChoices?: readonly PollChoice[];
}

const POLL_STATUS_SUFFIX = { draft: "", active: " ● פעיל", closed: " (סגור)" } as const;

// Every field is controlled: React 19 resets uncontrolled inputs to their
// defaultValue after a form action completes, which would wipe the admin's
// input whenever the server returns a validation error.
export function ArticleForm({ article, tagIds: savedTagIds, taxonomy, pollChoices }: ArticleFormProps) {
  const [state, formAction, isPending] = useActionState(saveArticle, initialState);
  const [title, setTitle] = useState(article?.title ?? "");
  const [subtitle, setSubtitle] = useState(article?.subtitle ?? "");
  const [authorName, setAuthorName] = useState(article?.authorName ?? "");
  const [episodeUrl, setEpisodeUrl] = useState(article?.episodeUrl ?? "");
  const [pollId, setPollId] = useState(article?.pollId ?? "");
  const [status, setStatus] = useState<"draft" | "published">(
    article?.status ?? "draft",
  );
  const [publishedAtLocal, setPublishedAtLocal] = useState(() =>
    toDatetimeLocalIsrael(article?.publishedAt),
  );
  const [tagIds, setTagIds] = useState<string[]>(() => [...(savedTagIds ?? [])]);
  const [catalog, setCatalog] = useState<TaxonomyTag[]>(() => [...taxonomy.tags]);
  const [format, setFormat] = useState<ArticleFormat>(article?.format ?? "story");
  // Null while the primary subject follows the tags; set once the admin picks one.
  const [chosenPrimary, setChosenPrimary] = useState<{ readonly id: string | null } | null>(() =>
    article ? { id: article.primarySubjectId } : null,
  );
  const [coverImageUrl, setCoverImageUrl] = useState(article?.coverImageUrl ?? "");
  const [coverCredit, setCoverCredit] = useState(article?.coverCredit ?? "");
  const [coverFocus, setCoverFocus] = useState<CoverFocus | null>(() =>
    article?.coverFocusX != null && article.coverFocusY != null
      ? { x: article.coverFocusX, y: article.coverFocusY }
      : null,
  );
  const [blocks, setBlocks] = useState<ArticleBlock[]>(() =>
    normalizeBlocks(article?.content ?? []),
  );

  const hasErrors = Object.keys(state.errors).length > 0;
  const subjectOfTag = useMemo(() => new Map(catalog.map((tag) => [tag.id, tag.subjectId])), [catalog]);
  const tagSubjects = tagIds.map((id) => subjectOfTag.get(id) ?? null);
  const suggestedPrimary = suggestPrimarySubject(tagSubjects, format);
  const primarySubjectId = chosenPrimary ? chosenPrimary.id : suggestedPrimary;

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {article ? <input type="hidden" name="id" value={article.id} /> : null}
      <input type="hidden" name="content" value={JSON.stringify(blocks)} />
      {tagIds.map((id) => (
        <input key={id} type="hidden" name="tagIds" value={id} />
      ))}
      <input type="hidden" name="coverImageUrl" value={coverImageUrl} />
      {coverImageUrl && coverFocus ? (
        <>
          <input type="hidden" name="coverFocusX" value={coverFocus.x} />
          <input type="hidden" name="coverFocusY" value={coverFocus.y} />
        </>
      ) : null}

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
          onChange={(event) => setTitle(event.target.value)}
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

      {coverImageUrl ? (
        <>
          <Field
            label="נקודת המוקד"
            group
            error={state.errors.coverFocusX ?? state.errors.coverFocusY}
            hint="בטלפון התמונה נחתכת לגובה. לחצו על מה שחייב להישאר בתמונה, למשל פני השחקן"
          >
            <CoverFocusField imageUrl={coverImageUrl} focus={coverFocus} onChange={setCoverFocus} />
          </Field>
          <Field label="קרדיט לתמונה" error={state.errors.coverCredit}>
            <input
              type="text"
              name="coverCredit"
              value={coverCredit}
              onChange={(event) => setCoverCredit(event.target.value)}
              placeholder="צילום: שם הצלם"
              className={inputClass}
            />
          </Field>
        </>
      ) : null}

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

      <Field
        label="קישור לפרק בספוטיפיי"
        error={state.errors.episodeUrl}
        hint="אם הכתבה מבוססת על פרק — הדביקו קישור לפרק והוא יופיע בראש הכתבה"
      >
        <input
          type="url"
          name="episodeUrl"
          dir="ltr"
          value={episodeUrl}
          onChange={(event) => setEpisodeUrl(event.target.value)}
          placeholder="https://open.spotify.com/episode/..."
          className={`${inputClass} text-left`}
        />
      </Field>

      {pollChoices && pollChoices.length > 0 ? (
        <Field
          label="סקר מקושר"
          error={state.errors.pollId}
          hint="סקר מקושר מופיע באמצע הכתבה; בלעדיו מוצג הסקר הראשי בסופה"
        >
          <select
            name="pollId"
            value={pollId}
            onChange={(event) => setPollId(event.target.value)}
            className={inputClass}
          >
            <option value="">ללא סקר</option>
            {pollChoices.map((choice) => (
              <option key={choice.id} value={choice.id}>
                {choice.question}
                {POLL_STATUS_SUFFIX[choice.status]}
              </option>
            ))}
          </select>
        </Field>
      ) : null}

      <Field label="תגיות" group error={state.errors.tagIds}>
        <TagPicker
          subjects={taxonomy.subjects}
          catalog={catalog}
          value={tagIds}
          onChange={setTagIds}
          onCreated={(tag) => setCatalog((current) => [...current, tag])}
        />
      </Field>

      <SubjectChoice
        subjects={taxonomy.subjects}
        tagSubjects={tagSubjects}
        primarySubjectId={primarySubjectId}
        suggestedPrimaryId={suggestedPrimary}
        format={format}
        onPrimaryChange={(id) => setChosenPrimary({ id })}
        onUseSuggestion={() => setChosenPrimary(null)}
        onFormatChange={setFormat}
      />
      {state.errors.primarySubjectId ? (
        <p className="text-sm text-red-400">{state.errors.primarySubjectId}</p>
      ) : null}

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
