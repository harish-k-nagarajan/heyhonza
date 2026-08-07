export const ROUTES = {
  home: "/",
  welcome: "/welcome",
  signup: "/signup",
  login: "/login",
  /** @deprecated Use ROUTES.login — kept for existing links and middleware redirects. */
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

/** Onboarding step 4 — how often Honza initiates per day. */
export const DAILY_MESSAGE_COUNTS = [1, 2, 3] as const;
export type DailyMessageCount = (typeof DAILY_MESSAGE_COUNTS)[number];
export const DEFAULT_DAILY_MESSAGE_COUNT: DailyMessageCount = 1;

/** Onboarding step 4 — fixed first message time vs random within the day. */
export type ScheduleMode = "specific" | "random";
export const DEFAULT_SCHEDULE_MODE: ScheduleMode = "specific";
export const DEFAULT_FIRST_MESSAGE_TIME = "09:00";

/** Copy for onboarding level rows (Handoff — Onboarding Flow). */
export const ONBOARDING_LEVEL_DETAILS: Record<LevelId, string> = {
  A1: "Beginner — zero stress.",
  A2: "Elementary — I push you further.",
  B1: "Intermediate — real topics.",
  B2: "Upper-int — almost fluent.",
};

/** Topic chip labels in onboarding step 3 (design uses shorter labels). */
export const ONBOARDING_TOPIC_LABELS: Record<TopicId, string> = {
  daily: "Daily life",
  travel: "Travel",
  food: "Food",
  work: "Work",
  grammar: "Grammar",
  smalltalk: "Small talk",
};
