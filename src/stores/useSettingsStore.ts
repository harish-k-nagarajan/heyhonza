import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { ModelId, TopicId } from "@/lib/constants";
import { buildLearnerContextText } from "@/lib/context";
import type { ContextChunk, ContextSource } from "@/types";

export type SettingsState = {
  onboardingComplete: boolean;
  selectedTopics: TopicId[];
  contextChunks: ContextChunk[];
  preferredModel: ModelId;
  setOnboardingComplete: (v: boolean) => void;
  setTopics: (topics: TopicId[]) => void;
  setPreferredModel: (m: ModelId) => void;
  addContextChunk: (text: string, meta: ContextSource) => void;
  removeContextChunk: (id: string) => void;
  getLearnerContextText: () => string;
  reset: () => void;
};

function rid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const initial = {
  onboardingComplete: false,
  selectedTopics: [] as TopicId[],
  contextChunks: [] as ContextChunk[],
  preferredModel: "gpt-4o-mini" as ModelId,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      ...initial,
      setOnboardingComplete: (v) => set({ onboardingComplete: v }),
      setTopics: (topics) => set({ selectedTopics: topics }),
      setPreferredModel: (m) => set({ preferredModel: m }),
      addContextChunk: (text, meta) => {
        const t = text.trim();
        if (!t) return;
        set((s) => ({
          contextChunks: [
            ...s.contextChunks,
            { id: rid(), text: t, meta },
          ],
        }));
      },
      removeContextChunk: (id) =>
        set((s) => ({
          contextChunks: s.contextChunks.filter((c) => c.id !== id),
        })),
      getLearnerContextText: () => buildLearnerContextText(get().contextChunks),
      reset: () => set(initial),
    }),
    { name: "honza-settings" },
  ),
);
