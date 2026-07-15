import { create } from "zustand";
import { persist } from "zustand/middleware";

import { DEFAULT_LEVEL_ID, DEFAULT_MODEL_ID } from "@/lib/constants";
import type { LevelId, ModelId, TopicId } from "@/lib/constants";
import { buildLearnerContextText } from "@/lib/context";
import type { ContextChunk, ContextSource } from "@/types";

export type SettingsState = {
  onboardingComplete: boolean;
  selectedTopics: TopicId[];
  contextChunks: ContextChunk[];
  preferredModel: ModelId;
  level: LevelId;
  setOnboardingComplete: (v: boolean) => void;
  setTopics: (topics: TopicId[]) => void;
  setPreferredModel: (m: ModelId) => void;
  setLevel: (l: LevelId) => void;
  addContextChunk: (text: string, meta: ContextSource, id?: string) => void;
  removeContextChunk: (id: string) => void;
  setContextChunks: (chunks: ContextChunk[]) => void;
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
  preferredModel: DEFAULT_MODEL_ID as ModelId,
  level: DEFAULT_LEVEL_ID as LevelId,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      ...initial,
      setOnboardingComplete: (v) => set({ onboardingComplete: v }),
      setTopics: (topics) => set({ selectedTopics: topics }),
      setPreferredModel: (m) => set({ preferredModel: m }),
      setLevel: (l) => set({ level: l }),
      addContextChunk: (text, meta, id) => {
        const t = text.trim();
        if (!t) return;
        set((s) => ({
          contextChunks: [
            ...s.contextChunks,
            { id: id ?? rid(), text: t, meta },
          ],
        }));
      },
      removeContextChunk: (id) =>
        set((s) => ({
          contextChunks: s.contextChunks.filter((c) => c.id !== id),
        })),
      setContextChunks: (chunks) => set({ contextChunks: chunks }),
      getLearnerContextText: () => buildLearnerContextText(get().contextChunks),
      reset: () => set(initial),
    }),
    { name: "honza-settings" },
  ),
);
