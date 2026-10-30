// Characters XML 1.0 forbids outright: C0 controls other than tab and line
// breaks, U+FFFE/U+FFFF, and lone surrogate halves (with the u flag a valid
// pair is one code point, so only an unpaired half matches). One pasted into
// a title would make the whole feed unparseable, so they are dropped.
const FORBIDDEN_IN_XML = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF\uD800-\uDFFF]/gu;

export function escapeXml(value: string): string {
  return value
    .replace(FORBIDDEN_IN_XML, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
