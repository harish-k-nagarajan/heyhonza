import "server-only";

import { DOC_CACHE_MS } from "@/lib/context";
import { fetchPublicGoogleDocAsText } from "@/lib/server/google-doc";
import type { ContextChunk } from "@/types";

type CachedDoc = { text: string; fetchedAt: number };
const memoryCache = new Map<string, CachedDoc>();

function cacheGet(url: string): string | null {
  const hit = memoryCache.get(url);
  if (!hit) return null;
  if (Date.now() - hit.fetchedAt >= DOC_CACHE_MS) {
    memoryCache.delete(url);
    return null;
  }
  return hit.text;
}

/**
 * Re-read public Google Docs when the stored snapshot is older than 15 minutes.
 * Failed fetches keep the last good text. Same-text hits still bump `addedAt`
 * so we do not hammer Google on every turn.
 */
export async function refreshGoogleDocChunks(
  chunks: ContextChunk[],
): Promise<{ chunks: ContextChunk[]; updates: { id: string; text: string }[] }> {
  const updates: { id: string; text: string }[] = [];
  const next: ContextChunk[] = [];

  for (const chunk of chunks) {
    if (chunk.meta.kind !== "google_doc" || !chunk.meta.url.trim()) {
      next.push(chunk);
      continue;
    }

    const url = chunk.meta.url.trim();
    const age = Date.now() - chunk.meta.addedAt;
    if (age < DOC_CACHE_MS) {
      next.push(chunk);
      continue;
    }

    let text = cacheGet(url);
    if (text == null) {
      const result = await fetchPublicGoogleDocAsText(url);
      if ("error" in result) {
        next.push(chunk);
        continue;
      }
      text = result.text;
      memoryCache.set(url, { text, fetchedAt: Date.now() });
    }

    const updated: ContextChunk = {
      ...chunk,
      text,
      meta: { ...chunk.meta, url, addedAt: Date.now() },
    };
    next.push(updated);
    updates.push({ id: chunk.id, text });
  }

  return { chunks: next, updates };
}
