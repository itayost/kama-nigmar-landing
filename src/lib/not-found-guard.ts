import { connection } from "next/server";

// A "not found" outcome of a dynamic route (/articles/[slug], /topics/[slug])
// must never be prerenderable, and it is the only outcome that needs the guard.
// A render with a concrete param is keyed on its own path (/articles/7), but a
// render with unresolved fallback params is keyed on the shared route entry and
// degrades the param to a placeholder - which never resolves, so it always lands
// on not-found. Without stalling, that complete not-found page is stored under
// the shared key and replayed at a 200 for every param generateStaticParams did
// not cover: every article or subject created since the last deploy, served a
// not-found body and a noindex head. The shared entry deliberately carries none
// of the path or "articles" cache tags, so neither updateTag nor revalidatePath
// can clear it afterwards.
//
// Under a real request connection() resolves immediately, so genuine 404s are
// unaffected, and found pages keep rendering as fully static per-path entries.
export async function stallNotFoundOutsidePrerender(): Promise<void> {
  await connection();
}
