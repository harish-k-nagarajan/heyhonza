import "server-only";

import { buildLearnerContextText, MAX_CONTEXT_CHARS } from "@/lib/context";
import { refreshGoogleDocChunks } from "@/lib/server/learner-notes";
import { resolveFocusTopic } from "@/lib/topic-focus";
import type { ContextChunk } from "@/types";

export async function prepareEngineTurn(opts: {
  bootstrap: boolean;
  topics: string[];
  focusTopic: string | null;
  recentTopics: string[];
  lastOpeners: string[];
  chunks: ContextChunk[];
  learnerContextFallback: string;
}): Promise<{
  focus: string | null;
  recent: string[];
  lastOpeners: string[];
  contextText: string;
  chunkUpdates: { id: string; text: string }[];
}> {
  let chunks = opts.chunks;
  let chunkUpdates: { id: string; text: string }[] = [];
  if (chunks.length > 0) {
    const refreshed = await refreshGoogleDocChunks(chunks);
    chunks = refreshed.chunks;
    chunkUpdates = refreshed.updates;
  }

  const contextText = chunks.length
    ? buildLearnerContextText(chunks)
    : opts.learnerContextFallback.slice(0, MAX_CONTEXT_CHARS);

  const rotated = resolveFocusTopic(
    opts.topics,
    opts.focusTopic,
    opts.recentTopics,
    opts.bootstrap,
  );

  return {
    focus: rotated.focus,
    recent: rotated.recent,
    lastOpeners: opts.lastOpeners,
    contextText,
    chunkUpdates,
  };
}
