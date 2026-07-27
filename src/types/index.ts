export type ChatRole = "user" | "assistant" | "system";

/**
 * Where a turn came from. Chat and call share one history (BUILD_SPEC §8: the
 * transcript is "part of one continuous record"), so this is the only thing
 * distinguishing a spoken turn from a typed one. Mirrors the `kind` column on
 * `messages` in `0002_conversations_and_context.sql`.
 */
export type MessageKind = "chat" | "call";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  kind?: MessageKind;
  sessionId?: string;
  createdAt: number;
};

/** Metadata for an ended (or active) typed-chat session. */
export type ChatSessionMeta = {
  id: string;
  startedAt: number;
  endedAt?: number;
  preview: string;
  messageCount: number;
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
