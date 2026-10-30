import type { TaxonomyMapping } from "./backfill-plan";

// The tag-to-subject mapping agreed on 2026-10-30, keyed by today's tag names.
// Tags created after that date are not listed and land in the admin's inbox.
export const TAXONOMY_MAPPING: TaxonomyMapping = {
  subjects: [
    { slug: "israeli-football", name: "כדורגל ישראלי", position: 1, onHomepage: true },
    { slug: "world-football", name: "כדורגל עולמי", position: 2, onHomepage: true },
    { slug: "basketball", name: "כדורסל", position: 3, onHomepage: true },
    { slug: "olympic-sports", name: "ספורט אולימפי", position: 4, onHomepage: true },
    // Hidden until it has articles of its own.
    { slug: "motorsport", name: "מוטורספורט", position: 5, onHomepage: false },
  ],
  tags: {
    "כדורגל": { kind: "retire", impliedBy: ["israeli-football", "world-football"] },
    "כדורגל ישראלי": { kind: "subject", subject: "israeli-football" },
    "כדורגל אירופי": { kind: "subject", subject: "world-football" },
    "סוף שבוע": { kind: "format", format: "roundup" },

    "ליגת העל": { kind: "tag", subject: "israeli-football" },

    "ליגת אלופות": { kind: "tag", subject: "world-football" },
    "כדורגל אנגלי": { kind: "tag", subject: "world-football", rename: "פרמייר ליג" },
    "כדורגל איטלקי": { kind: "tag", subject: "world-football", rename: "סרייה A" },
    "לסטר": { kind: "tag", subject: "world-football" },
    "מונדיאל": { kind: "tag", subject: "world-football" },
    "VAR": { kind: "tag", subject: "world-football" },
    "מנור סולומון": { kind: "tag", subject: "world-football" },

    // General tag until roundups get specific basketball tags.
    "כדורסל": { kind: "tag", subject: "basketball" },

    "אתלטיקה": { kind: "tag", subject: "olympic-sports" },
    "שחייה": { kind: "tag", subject: "olympic-sports" },
    "ארטיום דולגופיאט": { kind: "tag", subject: "olympic-sports" },

    "פורמולה": { kind: "tag", subject: "motorsport", rename: "פורמולה 1" },

    // Span several subjects; the admin decides where they live.
    "ליגיונרים": { kind: "tag", subject: null },
    "ספורט ישראלי": { kind: "tag", subject: null },
  },
  overrides: {
    // Hapoel Beer Sheva in the Champions League: Israeli football first.
    14: { primarySubject: "israeli-football" },
    6: { primarySubject: "israeli-football" },
  },
};
