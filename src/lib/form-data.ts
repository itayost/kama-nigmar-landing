// Readers for FormData fields that may be missing or left empty.

export function optionalString(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);
  return typeof value === "string" && value !== "" ? value : undefined;
}

export function optionalInt(formData: FormData, key: string): number | undefined {
  const value = optionalString(formData, key);
  return value === undefined ? undefined : Number(value);
}
