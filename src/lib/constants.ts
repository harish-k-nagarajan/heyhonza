export const ROUTES = {
  home: "/",
  welcome: "/welcome",
  signin: "/signin",
  onboarding: "/onboarding",
  chat: "/chat",
  call: "/call",
  settings: "/settings",
} as const;

export function chatHistoryRoute(id: string) {
  return `/chat/history/${id}`;
}

export const TOPIC_OPTIONS = [
  { id: "daily", label: "Daily life" },
  { id: "travel", label: "Travel" },
  { id: "food", label: "Food & dining" },
  { id: "work", label: "Work" },
  { id: "grammar", label: "Grammar" },
  { id: "smalltalk", label: "Small talk" },
] as const;

/**
 * Client display; server enforces the same allowlist. IDs are OpenRouter
 * model slugs (Phase 3 switched the gateway to OpenRouter).
 */
export const MODEL_OPTIONS = [
  { id: "openai/gpt-4o-mini", label: "GPT-4o mini" },
  { id: "openai/gpt-4o", label: "GPT-4o" },
] as const;

/** CEFR proficiency levels — drive how Honza scales vocabulary + corrections. */
export const LEVEL_OPTIONS = [
  { id: "A1", label: "A1 · Beginner" },
  { id: "A2", label: "A2 · Elementary" },
  { id: "B1", label: "B1 · Intermediate" },
  { id: "B2", label: "B2 · Upper-int." },
] as const;

export const DEFAULT_MODEL_ID = MODEL_OPTIONS[0].id;
export const DEFAULT_LEVEL_ID = "A2";

export type TopicId = (typeof TOPIC_OPTIONS)[number]["id"];
export type ModelId = (typeof MODEL_OPTIONS)[number]["id"];
export type LevelId = (typeof LEVEL_OPTIONS)[number]["id"];
