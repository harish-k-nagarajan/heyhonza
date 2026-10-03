import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { ChatMessage, ChatSessionMeta, MessageKind } from "@/types";

/** A notification tap, or Start, should open this waiting check-in. Not persisted. */
export type IncomingOpen =
  | { kind: "session"; sessionId: string }
  | { kind: "checkin" };

function id() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function previewFromMessages(messages: ChatMessage[]): string {
  const firstUser = messages.find((m) => m.role === "user");
  const firstAssistant = messages.find((m) => m.role === "assistant");
  const text = (firstUser ?? firstAssistant)?.content ?? "";
  return text.length > 80 ? `${text.slice(0, 77)}…` : text;
}

export type ChatPhase = "idle" | "active";

/** History metadata kept on the client. The live thread is never this list. */
const ENDED_SESSION_CAP = 40;

function isCallMessage(message: ChatMessage): boolean {
  return message.kind === "call";
}

/** Typed-chat turns for the open session. Call lines and session-less leftovers stay out. */
function liveTypedMessages(
  messages: ChatMessage[],
  activeSessionId: string | null,
): ChatMessage[] {
  if (!activeSessionId) return [];
  return messages.filter(
    (message) =>
      (message.role === "user" || message.role === "assistant") &&
      !isCallMessage(message),
  );
}

export type ChatState = {
  activeSessionId: string | null;
  endedSessions: ChatSessionMeta[];
  /** Full message archive keyed by session id (local pass-through + history view). */
  archivedMessages: Record<string, ChatMessage[]>;
  messages: ChatMessage[];
  status: "idle" | "loading" | "error";
  lastError: string | null;
  /** Assistant reply held during typing-phase reveal (ephemeral, not persisted). */
  typingPreview: string | null;
  chatPhase: ChatPhase;
  /** Set when a notification asks the app to open Honza's waiting message. */
  incomingOpen: IncomingOpen | null;
  setIncomingOpen: (incoming: IncomingOpen | null) => void;
  /** Continue a server thread that already contains Honza's check-in. */
  resumeSession: (
    sessionId: string,
    messages: ChatMessage[],
    closedSessions?: ChatSessionMeta[],
  ) => void;
  setTypingPreview: (text: string | null) => void;
  addUserMessage: (content: string, kind?: MessageKind) => void;
  addAssistantMessage: (content: string, kind?: MessageKind) => void;
  setMessages: (messages: ChatMessage[]) => void;
  setStatus: (s: ChatState["status"]) => void;
  setError: (msg: string | null) => void;
  startSession: (sessionId?: string) => string;
  /** Swap the local id for the server id without resetting the open thread. */
  replaceActiveSessionId: (sessionId: string) => void;
  endSession: () => void;
  hydrateSessions: (payload: {
    activeSessionId: string | null;
    endedSessions: ChatSessionMeta[];
    messages: ChatMessage[];
    archivedMessages?: Record<string, ChatMessage[]>;
  }) => void;
  setArchivedSessionMessages: (sessionId: string, messages: ChatMessage[]) => void;
  clearThread: () => void;
  reset: () => void;
};

type PersistedChatSlice = {
  activeSessionId: string | null;
  endedSessions: ChatSessionMeta[];
  archivedMessages: Record<string, ChatMessage[]>;
  messages: ChatMessage[];
};

function migrateLegacyState(raw: unknown): PersistedChatSlice {
  const base = {
    activeSessionId: null as string | null,
    endedSessions: [] as ChatSessionMeta[],
    archivedMessages: {} as Record<string, ChatMessage[]>,
    messages: [] as ChatMessage[],
  };

  if (!raw || typeof raw !== "object") return base;
  const state = raw as Partial<PersistedChatSlice & { messages?: ChatMessage[] }>;

  if (Array.isArray(state.messages) && state.messages.length > 0) {
    const chatOnly = state.messages.filter(
      (m) => m.role === "user" || m.role === "assistant",
    );
    if (chatOnly.length > 0 && (!state.endedSessions || state.endedSessions.length === 0)) {
      const sessionId = id();
      const endedAt = chatOnly[chatOnly.length - 1]!.createdAt;
      const startedAt = chatOnly[0]!.createdAt;
      return {
        activeSessionId: null,
        endedSessions: [
          {
            id: sessionId,
            startedAt,
            endedAt,
            preview: previewFromMessages(chatOnly),
            messageCount: chatOnly.length,
          },
        ],
        archivedMessages: { [sessionId]: chatOnly },
        messages: [],
      };
    }
  }

  return {
    activeSessionId: state.activeSessionId ?? null,
    endedSessions: state.endedSessions ?? [],
    archivedMessages: state.archivedMessages ?? {},
    messages: state.messages ?? [],
  };
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      activeSessionId: null,
      endedSessions: [],
      archivedMessages: {},
      messages: [],
      status: "idle",
      lastError: null,
      typingPreview: null,
      chatPhase: "idle",
      incomingOpen: null,
      setIncomingOpen: (incomingOpen) => set({ incomingOpen }),
      resumeSession: (sessionId, messages, closedSessions) => {
        const prev = get();
        let endedSessions = prev.endedSessions.filter((session) => session.id !== sessionId);
        let archivedMessages = prev.archivedMessages;
        if (prev.activeSessionId && prev.activeSessionId !== sessionId) {
          const thread = liveTypedMessages(prev.messages, prev.activeSessionId);
          if (thread.length > 0) {
            endedSessions = [
              {
                id: prev.activeSessionId,
                startedAt: thread[0]!.createdAt,
                endedAt: Date.now(),
                preview: previewFromMessages(thread),
                messageCount: thread.length,
              },
              ...endedSessions.filter((session) => session.id !== prev.activeSessionId),
            ];
            archivedMessages = { ...archivedMessages, [prev.activeSessionId]: thread };
          }
        }
        if (closedSessions && closedSessions.length > 0) {
          const closedIds = new Set(closedSessions.map((session) => session.id));
          endedSessions = [
            ...closedSessions.filter(
              (session) => session.id !== sessionId && session.messageCount > 0,
            ),
            ...endedSessions.filter((session) => !closedIds.has(session.id)),
          ];
        }
        set({
          activeSessionId: sessionId,
          messages,
          chatPhase: "active",
          lastError: null,
          typingPreview: null,
          status: "idle",
          incomingOpen: null,
          endedSessions: endedSessions.slice(0, ENDED_SESSION_CAP),
          archivedMessages,
        });
      },
      setTypingPreview: (typingPreview) => set({ typingPreview }),
      addUserMessage: (content, kind = "chat") => {
        const sessionId = get().activeSessionId;
        set((s) => ({
          messages: [
            ...s.messages,
            {
              id: id(),
              role: "user",
              content,
              kind,
              sessionId: sessionId ?? undefined,
              createdAt: Date.now(),
            },
          ],
        }));
      },
      addAssistantMessage: (content, kind = "chat") => {
        const sessionId = get().activeSessionId;
        set((s) => ({
          messages: [
            ...s.messages,
            {
              id: id(),
              role: "assistant",
              content,
              kind,
              sessionId: sessionId ?? undefined,
              createdAt: Date.now(),
            },
          ],
        }));
      },
      setMessages: (messages) =>
        set({
          messages,
          chatPhase: get().activeSessionId ? "active" : "idle",
        }),
      setStatus: (status) => set({ status }),
      setError: (lastError) => set({ lastError }),
      startSession: (sessionId) => {
        const sid = sessionId ?? id();
        set({
          activeSessionId: sid,
          messages: [],
          lastError: null,
          typingPreview: null,
          status: "idle",
          chatPhase: "active",
        });
        return sid;
      },
      replaceActiveSessionId: (sessionId) => {
        const current = get().activeSessionId;
        if (!current || current === sessionId) return;
        set({
          activeSessionId: sessionId,
          messages: get().messages.map((message) =>
            message.sessionId === current ? { ...message, sessionId } : message,
          ),
        });
      },
      endSession: () => {
        const { activeSessionId, messages, endedSessions, archivedMessages } = get();
        if (!activeSessionId) {
          set({
            messages: [],
            chatPhase: "idle",
            lastError: null,
            typingPreview: null,
            status: "idle",
          });
          return;
        }
        const thread = liveTypedMessages(messages, activeSessionId);
        if (thread.length > 0) {
          const meta: ChatSessionMeta = {
            id: activeSessionId,
            startedAt: thread[0]!.createdAt,
            endedAt: Date.now(),
            preview: previewFromMessages(thread),
            messageCount: thread.length,
          };
          set({
            endedSessions: [meta, ...endedSessions],
            archivedMessages: {
              ...archivedMessages,
              [activeSessionId]: thread,
            },
            activeSessionId: null,
            messages: [],
            chatPhase: "idle",
            lastError: null,
            typingPreview: null,
            status: "idle",
          });
        } else {
          set({
            activeSessionId: null,
            messages: [],
            chatPhase: "idle",
            lastError: null,
            typingPreview: null,
            status: "idle",
          });
        }
      },
      hydrateSessions: ({
        activeSessionId,
        endedSessions,
        messages,
        archivedMessages,
      }) => {
        const current = get();
        // A typed chat already open on this page stays. Otherwise restore the
        // conversation the learner already replied in. Unanswered check-ins
        // stay behind the Start gate until a notification or Start opens one.
        const inProgress =
          current.chatPhase === "active" && Boolean(current.activeSessionId);
        if (current.incomingOpen && !inProgress) {
          set({
            endedSessions: endedSessions.slice(0, ENDED_SESSION_CAP),
            archivedMessages: archivedMessages ?? current.archivedMessages,
          });
          return;
        }
        const restore =
          !inProgress && Boolean(activeSessionId) && messages.length > 0;
        set({
          endedSessions: endedSessions.slice(0, ENDED_SESSION_CAP),
          archivedMessages: archivedMessages ?? current.archivedMessages,
          ...(inProgress
            ? {}
            : restore
              ? {
                  activeSessionId,
                  messages,
                  chatPhase: "active" as const,
                  lastError: null,
                  typingPreview: null,
                  status: "idle" as const,
                }
              : {
                  activeSessionId: null,
                  messages: [],
                  chatPhase: "idle" as const,
                  lastError: null,
                  typingPreview: null,
                  status: "idle" as const,
                }),
        });
      },
      setArchivedSessionMessages: (sessionId, messages) =>
        set((s) => ({
          archivedMessages: { ...s.archivedMessages, [sessionId]: messages },
        })),
      clearThread: () =>
        set({
          messages: [],
          lastError: null,
          typingPreview: null,
          status: "idle",
          chatPhase: get().activeSessionId ? "active" : "idle",
        }),
      reset: () =>
        set({
          activeSessionId: null,
          endedSessions: [],
          archivedMessages: {},
          messages: [],
          status: "idle",
          lastError: null,
          typingPreview: null,
          chatPhase: "idle",
          incomingOpen: null,
        }),
    }),
    {
      name: "honza-chat",
      partialize: (s) => ({
        // A reload starts a new chat. Keeping the live thread here is what
        // brought call transcripts back as "in chat".
        activeSessionId: null,
        endedSessions: s.endedSessions.slice(0, ENDED_SESSION_CAP),
        archivedMessages: s.archivedMessages,
        messages: [],
      }),
      merge: (persisted, current) => {
        const migrated = migrateLegacyState(persisted);
        return {
          ...current,
          endedSessions: (migrated.endedSessions ?? []).slice(0, ENDED_SESSION_CAP),
          archivedMessages: migrated.archivedMessages,
          activeSessionId: null,
          messages: [],
          chatPhase: "idle" as const,
        };
      },
    },
  ),
);

export function previewFromThread(messages: ChatMessage[]): string {
  return previewFromMessages(messages);
}
