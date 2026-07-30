const HEBREW_LETTER_MAP: Readonly<Record<string, string>> = {
  א: "",
  ב: "b",
  ג: "g",
  ד: "d",
  ה: "h",
  ו: "v",
  ז: "z",
  ח: "ch",
  ט: "t",
  י: "y",
  כ: "k",
  ך: "k",
  ל: "l",
  מ: "m",
  ם: "m",
  נ: "n",
  ן: "n",
  ס: "s",
  ע: "",
  פ: "p",
  ף: "p",
  צ: "ts",
  ץ: "ts",
  ק: "k",
  ר: "r",
  ש: "sh",
  ת: "t",
};

const GERESH_DIGRAPH_MAP: Readonly<Record<string, string>> = {
  ג: "j",
  ז: "zh",
  צ: "ch",
  ץ: "ch",
  ת: "t",
  ד: "d",
};

const GERESH_CHARS = new Set(["׳", "'"]);
const NIQQUD_PATTERN = /[֑-ׇ]/g;
const MAX_SLUG_LENGTH = 100;

export function transliterateHebrew(input: string): string {
  const stripped = input.normalize("NFC").replace(NIQQUD_PATTERN, "");
  const chars = [...stripped];
  const out: string[] = [];

  for (let i = 0; i < chars.length; i += 1) {
    const char = chars[i];
    const next = chars[i + 1];
    const digraph = GERESH_DIGRAPH_MAP[char];

    if (digraph !== undefined && next !== undefined && GERESH_CHARS.has(next)) {
      out.push(digraph);
      i += 1;
      continue;
    }

    const mapped = HEBREW_LETTER_MAP[char];
    out.push(mapped ?? char);
  }

  return out.join("");
}

export function suggestSlug(title: string): string {
  const transliterated = transliterateHebrew(title).toLowerCase();
  return transliterated
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, MAX_SLUG_LENGTH)
    .replace(/-$/, "");
}
