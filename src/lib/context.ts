import type { ContextChunk } from "@/types";

export function buildLearnerContextText(chunks: ContextChunk[]): string {
  if (!chunks.length) return "";
  return chunks
    .map((c) => {
      const head =
        c.meta.kind === "google_doc"
          ? `## Google Doc\n${c.meta.url}`
          : c.meta.kind === "file"
            ? `## File: ${c.meta.name}`
            : `## ${c.meta.label}`;
      return `${head}\n\n${c.text}`;
    })
    .join("\n\n---\n\n");
}
