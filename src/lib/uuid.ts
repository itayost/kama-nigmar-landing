const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Postgres raises an error (not "no rows") when a uuid column is compared
// against a malformed value, so validate ids before they reach a query.
export function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}
