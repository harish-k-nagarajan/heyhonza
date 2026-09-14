"use client";

import { useEffect } from "react";

import { persistProfile } from "@/lib/client/context-actions";
import { fetchServerState } from "@/lib/client/state-sync";
import { useChatStore } from "@/stores/useChatStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { useSyncStore } from "@/stores/useSyncStore";
import type { ChatMessage } from "@/types";
import type { LevelId, TopicId } from "@/lib/constants";

/**
 * On first mount, ask the server whether this browser is a signed-in user with
 * DB-backed state. If so, overwrite the local Zustand stores with the DB truth
 * (chat history, settings, context) so history survives refresh / re-login and
 * a second user sees their own separate data. When not persisted (local
 * pass-through dev, or signed out), leaves the localStorage-backed stores as-is.
 */
export function ServerSync() {
  const markChecked = useSyncStore((s) => s.markChecked);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const data = await fetchServerState();
      if (cancelled) return;

      if (data.persisted && data.profile) {
        const settings = useSettingsStore.getState();
        settings.setLevel(data.profile.level as LevelId);
        settings.setTopics(data.profile.topics as TopicId[]);
        if (data.profile.preferredModel) {
          settings.setPreferredModel(data.profile.preferredModel);
        }
        const hasChatHistory =
          (data.messages?.length ?? 0) > 0 || (data.endedSessions?.length ?? 0) > 0;
        // Level/topics/timezone get written during the flow. If those landed but
        // `onboarding_completed` did not (e.g. a profile update that also set a
        // missing `onboarding_step` column), treat the learner as done.
        const finishedWithoutFlag =
          (data.profile.topics?.length ?? 0) > 0 && Boolean(data.profile.timezone);
        let onboardingDone = data.profile.onboardingCompleted;
        if (!onboardingDone && (hasChatHistory || finishedWithoutFlag)) {
          onboardingDone = true;
          void persistProfile({ onboardingCompleted: true });
        }
        settings.setOnboardingComplete(onboardingDone);
        if (!onboardingDone && typeof data.profile.onboardingStep === "number") {
          settings.setOnboardingStep(data.profile.onboardingStep as 1 | 2 | 3 | 4 | 5 | 6);
        }
        if (data.profile.name) settings.setLearnerName(data.profile.name);
        if (data.profile.formality) settings.setFormality(data.profile.formality);
        if (typeof data.profile.scheduleEnabled === "boolean") {
          settings.setScheduleEnabled(data.profile.scheduleEnabled);
        }
        if (data.profile.dailyMessageCount) {
          settings.setDailyMessageCount(data.profile.dailyMessageCount);
        }
        if (data.profile.scheduleMode) settings.setScheduleMode(data.profile.scheduleMode);
        if (data.profile.firstMessageTime) {
          settings.setFirstMessageTime(data.profile.firstMessageTime);
        }
        if (data.profile.timezone) settings.setTimezone(data.profile.timezone);
        settings.setContextChunks(data.contextChunks ?? []);

        // `kind` must survive hydration: it's what makes a call transcript
        // still read as a call after a refresh or a re-login.
        const mapped: ChatMessage[] = (data.messages ?? []).map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          kind: m.kind ?? "chat",
          sessionId: m.sessionId,
          createdAt: m.createdAt,
        }));
        useChatStore.getState().hydrateSessions({
          activeSessionId: data.activeSessionId ?? null,
          endedSessions: data.endedSessions ?? [],
          messages: mapped,
        });
      }

      markChecked(Boolean(data.persisted));
    })();
    return () => {
      cancelled = true;
    };
  }, [markChecked]);

  return null;
}
