export const ROUTES = {
  home: "/",
  onboarding: "/onboarding",
  chat: "/chat",
  settings: "/settings",
} as const;

export const TOPIC_OPTIONS = [
  { id: "daily", label: "Daily life" },
  { id: "travel", label: "Travel" },
  { id: "food", label: "Food & dining" },
  { id: "work", label: "Work" },
  { id: "grammar", label: "Grammar" },
  { id: "smalltalk", label: "Small talk" },
] as const;

/** Client display; server enforces the same allowlist. */
export const MODEL_OPTIONS = [
  { id: "gpt-4o-mini", label: "GPT-4o mini" },
  { id: "gpt-4o", label: "GPT-4o" },
] as const;

export type TopicId = (typeof TOPIC_OPTIONS)[number]["id"];
export type ModelId = (typeof MODEL_OPTIONS)[number]["id"];
