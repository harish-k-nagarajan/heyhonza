export type ChatRole = "user" | "assistant" | "system";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: number;
};

export type ContextSource =
  | { kind: "pasted"; label: string; addedAt: number }
  | { kind: "google_doc"; url: string; addedAt: number }
  | { kind: "file"; name: string; addedAt: number };

export type ContextChunk = {
  id: string;
  text: string;
  meta: ContextSource;
};
