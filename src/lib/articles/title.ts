// Headlines here often put a space before a closing ? or ! ("לסטר, זאת את ?").
// A plain space lets the mark wrap onto a line of its own; a no-break space
// keeps it with its word, and the writer's spacing still shows.
const SPACE_BEFORE_MARK = /(?<=\S)[ \t]+(?=[?!])/g;

export function bindClosingMarks(title: string): string {
  return title.replace(SPACE_BEFORE_MARK, " ");
}

// Episode and some article titles open with the show's question: "כמה נגמר ?
// 23.10.2011". Returns what follows it, so the page can draw the question as
// the wordmark or leave it out; null when the title does not open with it or
// has nothing after it.
const SHOW_QUESTION = /^כמה נגמר\s*\?\s*/;

export function splitShowQuestion(title: string): string | null {
  const match = SHOW_QUESTION.exec(title);
  if (!match) return null;
  const rest = title.slice(match[0].length).trim();
  return rest.length > 0 ? rest : null;
}
