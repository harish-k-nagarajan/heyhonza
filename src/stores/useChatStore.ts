import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { ChatMessage, MessageKind } from "@/types";

function id() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export type ChatState = {
  messages: ChatMessage[];
  status: "idle" | "loading" | "error";
  lastError: string | null;
  addUserMessage: (content: string, kind?: MessageKind) => void;
  addAssistantMessage: (content: string, kind?: MessageKind) => void;
  setMessages: (messages: ChatMessage[]) => void;
  setStatus: (s: ChatState["status"]) => void;
  setError: (msg: string | null) => void;
  clearThread: () => void;
};

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: [],
      status: "idle",
      lastError: null,
      addUserMessage: (content, kind = "chat") =>
        set((s) => ({
          messages: [
            ...s.messages,
            {
              id: id(),
              role: "user",
              content,
              kind,
              createdAt: Date.now(),
            },
          ],
        })),
      addAssistantMessage: (content, kind = "chat") =>
        set((s) => ({
          messages: [
            ...s.messages,
            {
              id: id(),
              role: "assistant",
              content,
              kind,
              createdAt: Date.now(),
            },
          ],
        })),
      setMessages: (messages) => set({ messages }),
      setStatus: (status) => set({ status }),
      setError: (lastError) => set({ lastError }),
      clearThread: () => set({ messages: [], lastError: null, status: "idle" }),
    }),
    { name: "honza-chat", partialize: (s) => ({ messages: s.messages }) },
  ),
);
