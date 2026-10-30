// What kind of piece an article is, independent of its subject.
export const ARTICLE_FORMATS = ["story", "roundup", "guide"] as const;

export type ArticleFormat = (typeof ARTICLE_FORMATS)[number];

export const FORMAT_LABELS: Record<ArticleFormat, string> = {
  story: "כתבה",
  roundup: "סיכום",
  guide: "מדריך",
};
