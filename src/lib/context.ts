import type { ContextChunk } from "@/types";

/** Per-source cap so the system prompt stays cheap. */
export const MAX_CONTEXT_CHARS = 4_000;
const MAX_PER_SOURCE = 1_800;

function clip(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}

export function buildLearnerContextText(chunks: ContextChunk[]): string {
  if (!chunks.length) return "";
  const joined = chunks
    .map((c) => {
      const head =
        c.meta.kind === "google_doc"
          ? `## Google Doc\n${c.meta.url}`
          : c.meta.kind === "file"
            ? `## File: ${c.meta.name}`
            : `## ${c.meta.label}`;
      return `${head}\n\n${clip(c.text, MAX_PER_SOURCE)}`;
    })
    .join("\n\n---\n\n");
  return clip(joined, MAX_CONTEXT_CHARS);
}
