// Canonical form only (no leading zeros): "07" must fall through to the
// legacy-slug path so each article has exactly one numeric URL.
const CANONICAL_NUMBER_PATTERN = /^[1-9]\d{0,8}$/;

export function parseArticleNumber(param: string): number | null {
  if (!CANONICAL_NUMBER_PATTERN.test(param)) return null;
  return Number(param);
}
