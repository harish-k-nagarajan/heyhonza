import { TOPIC_OPTIONS, type TopicId } from "@/lib/constants";

export const RECENT_TOPIC_LIMIT = 5;
export const LAST_OPENER_LIMIT = 3;
export const THREAD_TURN_LIMIT = 12;
export const MAX_OPENER_CHARS = 160;

const TOPIC_IDS = new Set<string>(TOPIC_OPTIONS.map((t) => t.id));

export function asTopicIds(ids: string[] | undefined): TopicId[] {
  if (!ids?.length) return [];
  return ids.filter((id): id is TopicId => TOPIC_IDS.has(id));
}

export function topicLabel(id: string | null | undefined): string | null {
  if (!id) return null;
  return TOPIC_OPTIONS.find((t) => t.id === id)?.label ?? null;
}

export function topicLabelsFor(ids: string[] | undefined): string[] {
  return asTopicIds(ids).map((id) => topicLabel(id) ?? id);
}

/**
 * Pick the next session topic from the learner's chips, skipping the ones we
 * just used. Deterministic — no extra model call.
 */
export function nextFocusTopic(
  selected: string[] | undefined,
  recent: string[] | undefined,
): { focus: string | null; recent: string[] } {
  const chips = asTopicIds(selected);
  const prev = asTopicIds(recent).slice(-RECENT_TOPIC_LIMIT);
  if (chips.length === 0) {
    return { focus: null, recent: prev };
  }

  const skip = new Set(prev);
  const pick =
    chips.find((id) => !skip.has(id)) ??
    chips.find((id) => id !== prev[prev.length - 1]) ??
    chips[0]!;

  const nextRecent = [...prev.filter((id) => id !== pick), pick].slice(
    -RECENT_TOPIC_LIMIT,
  );
  return { focus: pick, recent: nextRecent };
}

/** Keep current focus if it is still selected; otherwise rotate. */
export function resolveFocusTopic(
  selected: string[] | undefined,
  focus: string | null | undefined,
  recent: string[] | undefined,
  rotate: boolean,
): { focus: string | null; recent: string[] } {
  const chips = asTopicIds(selected);
  if (rotate || !focus || !chips.includes(focus as TopicId)) {
    return nextFocusTopic(chips, recent);
  }
  return { focus, recent: asTopicIds(recent).slice(-RECENT_TOPIC_LIMIT) };
}

export function clipOpener(text: string): string {
  const compact = text.replace(/\s+/g, " ").trim();
  if (compact.length <= MAX_OPENER_CHARS) return compact;
  return `${compact.slice(0, MAX_OPENER_CHARS - 1).trimEnd()}…`;
}

/** Prefer the last question in the opener; otherwise a short prefix. */
export function openerFingerprint(reply: string): string {
  const trimmed = reply.replace(/\s+/g, " ").trim();
  if (!trimmed) return "";
  const questions = trimmed.match(/[^.!?]*\?/g);
  const lastQ = questions?.[questions.length - 1]?.trim();
  return clipOpener(lastQ || trimmed);
}

export function rememberOpener(previous: string[] | undefined, reply: string): string[] {
  const next = openerFingerprint(reply);
  if (!next) return (previous ?? []).slice(-LAST_OPENER_LIMIT);
  const rest = (previous ?? []).filter((p) => p !== next);
  return [...rest, next].slice(-LAST_OPENER_LIMIT);
}

export function asStringList(value: unknown, max: number): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    .map((item) => item.trim())
    .slice(-max);
}
