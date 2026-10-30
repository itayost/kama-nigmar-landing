import {
  boolean,
  check,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import type { StoredBlock } from "@/lib/articles/blocks";
import type { PollOption } from "@/lib/polls/schema";
import { ARTICLE_FORMATS } from "@/lib/taxonomy/format";

export const articleStatus = pgEnum("article_status", ["draft", "published"]);
export const pollStatus = pgEnum("poll_status", ["draft", "active", "closed"]);
export const articleFormat = pgEnum("article_format", ARTICLE_FORMATS);

// The short, admin-curated list of sections readers navigate by.
export const subjects = pgTable(
  "subjects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull().unique(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    position: integer("position").notNull(),
    onHomepage: boolean("on_homepage").notNull().default(true),
    // The subject's line color: its label, section mark and nav dot.
    color: text("color").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [check("subjects_color_hex", sql`${table.color} ~ '^#[0-9a-f]{6}$'`)],
);

export const polls = pgTable("polls", {
  id: uuid("id").primaryKey().defaultRandom(),
  question: text("question").notNull(),
  options: jsonb("options").$type<PollOption[]>().notNull(),
  status: pollStatus("status").notNull().default("draft"),
  // At most one poll is main: it renders on the homepage and as the article fallback.
  isMain: boolean("is_main").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const articles = pgTable(
  "articles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    number: integer("number").generatedAlwaysAsIdentity().unique(),
    // Legacy transliterated slugs kept only for permanent redirects; new
    // articles are addressed by number and never receive one.
    slug: text("slug").unique(),
    title: text("title").notNull(),
    subtitle: text("subtitle"),
    coverImageUrl: text("cover_image_url"),
    // Shown as a caption on the cover; previously typed into author_name.
    coverCredit: text("cover_credit"),
    // Focal point of the cover in percent, so phone crops keep the subject.
    // Null means centered.
    coverFocusX: smallint("cover_focus_x"),
    coverFocusY: smallint("cover_focus_y"),
    content: jsonb("content").$type<StoredBlock[]>().notNull().default([]),
    authorName: text("author_name").notNull(),
    episodeUrl: text("episode_url"),
    pollId: uuid("poll_id").references(() => polls.id, { onDelete: "set null" }),
    // Legacy flat tag list, kept as a rollback mirror of article_tags: every
    // admin save rewrites it in tag order, and only the backfill reads it.
    // The site reads article_tags (ADR 0002).
    tags: text("tags").array().notNull().default([]),
    // Drives the label above the headline, the breadcrumb and the SEO section.
    // Null for a roundup that spans several subjects.
    primarySubjectId: uuid("primary_subject_id").references(() => subjects.id, {
      onDelete: "set null",
    }),
    format: articleFormat("format").notNull().default("story"),
    status: articleStatus("status").notNull().default("draft"),
    views: integer("views").notNull().default(0),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("articles_status_published_at_idx").on(table.status, table.publishedAt),
    index("articles_tags_idx").using("gin", table.tags),
    index("articles_primary_subject_id_idx").on(table.primarySubjectId),
    check("articles_cover_focus_x_range", sql`${table.coverFocusX} between 0 and 100`),
    check("articles_cover_focus_y_range", sql`${table.coverFocusY} between 0 and 100`),
  ],
);

// Daily view rollups powering the 7-day Trending window (ADR 0001).
export const articleViewsDaily = pgTable(
  "article_views_daily",
  {
    articleId: uuid("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    day: date("day").notNull(),
    count: integer("count").notNull().default(0),
  },
  (table) => [primaryKey({ columns: [table.articleId, table.day] })],
);

export const tags = pgTable(
  "tags",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull().unique(),
    // Set by the admin; null leaves the tag waiting in the inbox.
    subjectId: uuid("subject_id").references(() => subjects.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("tags_subject_id_idx").on(table.subjectId)],
);

// An article's tags in display order. An article belongs to its primary
// subject and to every subject its tags belong to.
export const articleTags = pgTable(
  "article_tags",
  {
    articleId: uuid("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
    position: smallint("position").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.articleId, table.tagId] }),
    index("article_tags_tag_id_idx").on(table.tagId),
  ],
);

export const pollVotes = pgTable(
  "poll_votes",
  {
    pollId: uuid("poll_id")
      .notNull()
      .references(() => polls.id, { onDelete: "cascade" }),
    optionId: text("option_id").notNull(),
    count: integer("count").notNull().default(0),
  },
  (table) => [primaryKey({ columns: [table.pollId, table.optionId] })],
);

export type Article = typeof articles.$inferSelect;
export type NewArticle = typeof articles.$inferInsert;
export type Tag = typeof tags.$inferSelect;
export type Subject = typeof subjects.$inferSelect;
export type ArticleTag = typeof articleTags.$inferSelect;
export type Poll = typeof polls.$inferSelect;
