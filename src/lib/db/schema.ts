import {
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import type { ArticleBlock } from "@/lib/articles/blocks";

export const articleStatus = pgEnum("article_status", ["draft", "published"]);

export const articles = pgTable(
  "articles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    subtitle: text("subtitle"),
    coverImageUrl: text("cover_image_url"),
    content: jsonb("content").$type<ArticleBlock[]>().notNull().default([]),
    authorName: text("author_name").notNull(),
    tags: text("tags").array().notNull().default([]),
    status: articleStatus("status").notNull().default("draft"),
    views: integer("views").notNull().default(0),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("articles_status_published_at_idx").on(table.status, table.publishedAt),
    index("articles_tags_idx").using("gin", table.tags),
  ],
);

export const tags = pgTable("tags", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Article = typeof articles.$inferSelect;
export type NewArticle = typeof articles.$inferInsert;
export type Tag = typeof tags.$inferSelect;
