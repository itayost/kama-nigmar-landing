// Characters XML 1.0 forbids outright: C0 controls other than tab and line
// breaks, lone surrogate halves, and U+FFFE/U+FFFF. One pasted into a title
// would make the whole feed unparseable, so they are dropped, not escaped.
const FORBIDDEN_IN_XML = /[\u0000-\u0008\u000B\u000C\u000E-\u001F￾￿]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g;

export function escapeXml(value: string): string {
  return value
    .replace(FORBIDDEN_IN_XML, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
