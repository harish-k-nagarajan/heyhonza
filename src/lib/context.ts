import type { ContextChunk } from "@/types";

/** Per-source cap so the system prompt stays cheap. */
export const MAX_CONTEXT_CHARS = 4_000;
const MAX_PER_SOURCE = 1_800;
const MAX_VOCAB_LINES = 25;
const VOCAB_SCAN_CHARS = 8_000;
export const DOC_CACHE_MS = 15 * 60 * 1000;

function clip(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}

/** Teacher notes grow at the bottom — keep the newest part, not the intro. */
export function clipTail(text: string, max: number): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `…${t.slice(-(max - 1)).trimStart()}`;
}

const VOCAB_LINE =
  /[—–−]|\t|\s[-=]\s|:\s|\s\/\s|^\s*[-*•]\s+\S/;

export function extractVocabLines(text: string, max = MAX_VOCAB_LINES): string[] {
  const source = text.length > VOCAB_SCAN_CHARS ? text.slice(-VOCAB_SCAN_CHARS) : text;
  const hits: string[] = [];
  for (const raw of source.split(/\r?\n/)) {
    const line = raw.trim().replace(/^[-*•]\s+/, "");
    if (line.length < 3 || line.length > 140) continue;
    if (/^#{1,6}\s/.test(line)) continue;
    if (/^[-=_*]{3,}$/.test(line)) continue;
    if (!VOCAB_LINE.test(raw) && !VOCAB_LINE.test(line)) continue;
    if (!hits.includes(line)) hits.push(line);
  }
  return hits.slice(-max);
}

function distillSource(text: string): { body: string; vocab: string[] } {
  const vocab = extractVocabLines(text);
  const vocabBudget = vocab.length ? Math.min(900, vocab.join("\n").length + 40) : 0;
  const bodyMax = Math.max(400, MAX_PER_SOURCE - vocabBudget);
  return { body: clipTail(text, bodyMax), vocab };
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
      const { body, vocab } = distillSource(c.text);
      const vocabBlock =
        vocab.length > 0
          ? `\n\nWords/phrases to practice (from the newest notes):\n${vocab.map((v) => `- ${v}`).join("\n")}`
          : "";
      return `${head}\n\nNewest material:\n${body}${vocabBlock}`;
    })
    .join("\n\n---\n\n");
  return clip(joined, MAX_CONTEXT_CHARS);
}
