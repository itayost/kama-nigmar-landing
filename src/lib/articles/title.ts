// Headlines here often put a space before a closing ? or ! ("לסטר, זאת את ?").
// A plain space lets the mark wrap onto a line of its own; a no-break space
// keeps it with its word, and the writer's spacing still shows.
const SPACE_BEFORE_MARK = /(?<=\S)[ \t]+(?=[?!])/g;

export function bindClosingMarks(title: string): string {
  return title.replace(SPACE_BEFORE_MARK, " ");
}
