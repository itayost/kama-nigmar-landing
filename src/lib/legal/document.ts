// Shape of the site's legal pages (Terms of Use, Privacy Policy). The text
// lives in typed data modules rather than JSX so the wording stays reviewable
// as prose, the section numbering is derived rather than hand-maintained, and
// the "last updated" stamp is a fixed literal instead of a render-time date.

export type LegalBlock =
  | { readonly type: "paragraph"; readonly text: string }
  | { readonly type: "list"; readonly items: readonly string[] };

export interface LegalSection {
  readonly heading: string;
  readonly body: readonly LegalBlock[];
}

export interface LegalDocument {
  readonly title: string;
  readonly description: string;
  /** ISO date (YYYY-MM-DD) of the last substantive revision. */
  readonly updatedAt: string;
  readonly intro: readonly string[];
  readonly sections: readonly LegalSection[];
}
