// "כתבה אחת" or "N כתבות": the article count as the site writes it.
export function articleCountLabel(count: number): string {
  return count === 1 ? "כתבה אחת" : `${count} כתבות`;
}
