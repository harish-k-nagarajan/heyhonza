import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  DEFAULT_DAILY_MESSAGE_COUNT,
  DEFAULT_FIRST_MESSAGE_TIME,
  DEFAULT_FORMALITY,
  DEFAULT_LEVEL_ID,
  DEFAULT_MODEL_ID,
  DEFAULT_SCHEDULE_MODE,
  type DailyMessageCount,
  type FormalityMode,
  type LevelId,
  type ModelId,
  type ScheduleMode,
  type TopicId,
} from "@/lib/constants";
import { buildLearnerContextText } from "@/lib/context";
import { persistUiLocaleCookie } from "@/lib/i18n/locale-cookie";
import { DEFAULT_LOCALE, type UiLocale } from "@/lib/i18n/locales";
import { asTopicIds } from "@/lib/topic-focus";
import type { ContextChunk, ContextSource } from "@/types";

export type { FormalityMode };

export type OnboardingStepNumber = 1 | 2 | 3 | 4 | 5 | 6;

export type SettingsState = {
  onboardingComplete: boolean;
  onboardingStep: OnboardingStepNumber;
  selectedTopics: TopicId[];
  focusTopic: TopicId | null;
  recentTopics: TopicId[];
  lastOpeners: string[];
  contextChunks: ContextChunk[];
  preferredModel: ModelId;
  level: LevelId;
  learnerName: string;
  /** Legal / full name shown on the account card. `learnerName` is what Honza says. */
  fullName: string;
  timezone: string;
  scheduleEnabled: boolean;
  dailyMessageCount: DailyMessageCount;
  scheduleMode: ScheduleMode;
  firstMessageTime: string;
  formality: FormalityMode;
  uiLocale: UiLocale;
  setUiLocale: (locale: UiLocale) => void;
  setOnboardingComplete: (v: boolean) => void;
  setOnboardingStep: (step: OnboardingStepNumber) => void;
  setTopics: (topics: TopicId[]) => void;
  setEngineFocus: (state: {
    focusTopic: TopicId | null;
    recentTopics: TopicId[];
    lastOpeners: string[];
  }) => void;
  setPreferredModel: (m: ModelId) => void;
  setLevel: (l: LevelId) => void;
  setLearnerName: (name: string) => void;
  setFullName: (name: string) => void;
  setTimezone: (tz: string) => void;
  setScheduleEnabled: (enabled: boolean) => void;
  setDailyMessageCount: (count: DailyMessageCount) => void;
  setScheduleMode: (mode: ScheduleMode) => void;
  setFirstMessageTime: (time: string) => void;
  setFormality: (mode: FormalityMode) => void;
  addContextChunk: (text: string, meta: ContextSource, id?: string) => void;
  replaceContextByKind: (text: string, meta: ContextSource, id?: string) => void;
  removeContextChunk: (id: string) => void;
  setContextChunks: (chunks: ContextChunk[]) => void;
  getLearnerContextText: () => string;
  reset: () => void;
};

function rid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function clampOnboardingStep(n: number): OnboardingStepNumber {
  const v = Math.min(6, Math.max(1, Math.round(n)));
  return v as OnboardingStepNumber;
}

const initial = {
  onboardingComplete: false,
  onboardingStep: 1 as OnboardingStepNumber,
  selectedTopics: [] as TopicId[],
  focusTopic: null as TopicId | null,
  recentTopics: [] as TopicId[],
  lastOpeners: [] as string[],
  contextChunks: [] as ContextChunk[],
  preferredModel: DEFAULT_MODEL_ID as ModelId,
  level: DEFAULT_LEVEL_ID as LevelId,
  learnerName: "",
  fullName: "",
  timezone: "UTC",
  scheduleEnabled: true,
  dailyMessageCount: DEFAULT_DAILY_MESSAGE_COUNT,
  scheduleMode: DEFAULT_SCHEDULE_MODE,
  firstMessageTime: DEFAULT_FIRST_MESSAGE_TIME,
  formality: DEFAULT_FORMALITY as FormalityMode,
  uiLocale: DEFAULT_LOCALE as UiLocale,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      ...initial,
      setUiLocale: (uiLocale) => {
        persistUiLocaleCookie(uiLocale);
        set({ uiLocale });
      },
      setOnboardingComplete: (v) => set({ onboardingComplete: v }),
      setOnboardingStep: (step) => set({ onboardingStep: clampOnboardingStep(step) }),
      setTopics: (topics) => set({ selectedTopics: topics }),
      setEngineFocus: ({ focusTopic, recentTopics, lastOpeners }) =>
        set({
          focusTopic: asTopicIds(focusTopic ? [focusTopic] : [])[0] ?? null,
          recentTopics: asTopicIds(recentTopics),
          lastOpeners,
        }),
      setPreferredModel: (m) => set({ preferredModel: m }),
      setLevel: (l) => set({ level: l }),
      setLearnerName: (learnerName) => set({ learnerName }),
      setFullName: (fullName) => set({ fullName }),
      setTimezone: (timezone) => set({ timezone }),
      setScheduleEnabled: (scheduleEnabled) => set({ scheduleEnabled }),
      setDailyMessageCount: (dailyMessageCount) => set({ dailyMessageCount }),
      setScheduleMode: (scheduleMode) => set({ scheduleMode }),
      setFirstMessageTime: (firstMessageTime) => set({ firstMessageTime }),
      setFormality: (formality) => set({ formality }),
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
      replaceContextByKind: (text, meta, id) => {
        const t = text.trim();
        if (!t) return;
        set((s) => ({
          contextChunks: [
            ...s.contextChunks.filter((c) => c.meta.kind !== meta.kind),
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
      reset: () => set({ ...initial, uiLocale: get().uiLocale }),
    }),
    {
      name: "honza-settings",
      onRehydrateStorage: () => (state) => {
        if (state?.uiLocale) persistUiLocaleCookie(state.uiLocale);
      },
    },
  ),
);
