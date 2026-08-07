import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  DEFAULT_DAILY_MESSAGE_COUNT,
  DEFAULT_FIRST_MESSAGE_TIME,
  DEFAULT_LEVEL_ID,
  DEFAULT_MODEL_ID,
  DEFAULT_SCHEDULE_MODE,
} from "@/lib/constants";
import type {
  DailyMessageCount,
  LevelId,
  ModelId,
  ScheduleMode,
  TopicId,
} from "@/lib/constants";
import { buildLearnerContextText } from "@/lib/context";
import { DEFAULT_LOCALE, type UiLocale } from "@/lib/i18n/locales";
import type { ContextChunk, ContextSource } from "@/types";

export type SettingsState = {
  onboardingComplete: boolean;
  selectedTopics: TopicId[];
  contextChunks: ContextChunk[];
  preferredModel: ModelId;
  level: LevelId;
  dailyMessageCount: DailyMessageCount;
  scheduleMode: ScheduleMode;
  firstMessageTime: string;
  uiLocale: UiLocale;
  setUiLocale: (locale: UiLocale) => void;
  setOnboardingComplete: (v: boolean) => void;
  setTopics: (topics: TopicId[]) => void;
  setPreferredModel: (m: ModelId) => void;
  setLevel: (l: LevelId) => void;
  setDailyMessageCount: (count: DailyMessageCount) => void;
  setScheduleMode: (mode: ScheduleMode) => void;
  setFirstMessageTime: (time: string) => void;
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
  dailyMessageCount: DEFAULT_DAILY_MESSAGE_COUNT,
  scheduleMode: DEFAULT_SCHEDULE_MODE,
  firstMessageTime: DEFAULT_FIRST_MESSAGE_TIME,
  uiLocale: DEFAULT_LOCALE as UiLocale,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      ...initial,
      setUiLocale: (uiLocale) => set({ uiLocale }),
      setOnboardingComplete: (v) => set({ onboardingComplete: v }),
      setTopics: (topics) => set({ selectedTopics: topics }),
      setPreferredModel: (m) => set({ preferredModel: m }),
      setLevel: (l) => set({ level: l }),
      setDailyMessageCount: (dailyMessageCount) => set({ dailyMessageCount }),
      setScheduleMode: (scheduleMode) => set({ scheduleMode }),
      setFirstMessageTime: (firstMessageTime) => set({ firstMessageTime }),
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
