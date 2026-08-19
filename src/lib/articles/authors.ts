// Author avatars are static assets keyed by the free-text author name stored on
// each article. Names with no entry here fall back to the initial badge, so
// adding a writer is one line plus the file under public/authors/.
// A Map, not an object literal, so names like "constructor" cannot hit
// Object.prototype and resolve to something that is not an avatar.
const AUTHOR_AVATARS = new Map<string, string>([["גיא צינקר", "/authors/guy-tsinker.webp"]]);

export function authorAvatarUrl(authorName: string): string | null {
  return AUTHOR_AVATARS.get(authorName.trim()) ?? null;
}
