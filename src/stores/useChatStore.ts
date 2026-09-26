import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { ChatMessage, ChatSessionMeta, MessageKind } from "@/types";

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
  setTypingPreview: (text: string | null) => void;
  addUserMessage: (content: string, kind?: MessageKind) => void;
  addAssistantMessage: (content: string, kind?: MessageKind) => void;
  setMessages: (messages: ChatMessage[]) => void;
  setStatus: (s: ChatState["status"]) => void;
  setError: (msg: string | null) => void;
  startSession: (sessionId?: string) => string;
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
          chatPhase: messages.length > 0 ? "active" : get().chatPhase,
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
        const thread = messages.filter((m) => m.role === "user" || m.role === "assistant");
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
      hydrateSessions: ({ activeSessionId, endedSessions, messages, archivedMessages }) => {
        const hasThread = messages.length > 0;
        set({
          activeSessionId: hasThread ? activeSessionId : null,
          endedSessions,
          messages,
          archivedMessages: archivedMessages ?? get().archivedMessages,
          chatPhase: hasThread ? "active" : "idle",
          lastError: null,
          typingPreview: null,
          status: "idle",
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
        }),
    }),
    {
      name: "honza-chat",
      partialize: (s) => ({
        activeSessionId: s.activeSessionId,
        endedSessions: s.endedSessions,
        archivedMessages: s.archivedMessages,
        messages: s.messages,
      }),
      merge: (persisted, current) => {
        const migrated = migrateLegacyState(persisted);
        const chatPhase: ChatPhase = migrated.messages.length > 0 ? "active" : "idle";
        return {
          ...current,
          ...migrated,
          chatPhase,
        };
      },
    },
  ),
);

export function previewFromThread(messages: ChatMessage[]): string {
  return previewFromMessages(messages);
}
