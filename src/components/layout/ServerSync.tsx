"use client";

import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { useEffect, useRef } from "react";

import { persistProfile } from "@/lib/client/context-actions";
import {
  clearLocalUserState,
  getLocalOwnerId,
  setLocalOwnerId,
  waitForLocalUserState,
} from "@/lib/client/local-user-state";
import { fetchServerState, type ServerState } from "@/lib/client/state-sync";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { useChatStore } from "@/stores/useChatStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { useSyncStore } from "@/stores/useSyncStore";
import type { LevelId, TopicId } from "@/lib/constants";

function applyServerState(data: ServerState): void {
  if (!data.persisted || !data.profile) return;

  if (data.userId && getLocalOwnerId() !== data.userId) {
    clearLocalUserState();
    setLocalOwnerId(data.userId);
  }
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
  settings.setLearnerName(data.profile.name ?? "");
  if ("fullName" in data.profile) {
    settings.setFullName(data.profile.fullName ?? "");
  }
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
  settings.setSecondMessageTime(
    typeof data.profile.secondMessageTime === "string" ? data.profile.secondMessageTime : null,
  );
  settings.setThirdMessageTime(
    typeof data.profile.thirdMessageTime === "string" ? data.profile.thirdMessageTime : null,
  );
  if (data.profile.timezone) settings.setTimezone(data.profile.timezone);
  settings.setEngineFocus({
    focusTopic: (data.profile.focusTopic as TopicId | null) ?? null,
    recentTopics: (data.profile.recentTopics as TopicId[] | undefined) ?? [],
    lastOpeners: data.profile.lastOpeners ?? [],
  });
  settings.setContextChunks(data.contextChunks ?? []);

  // History metadata only. The live thread stays empty unless this page
  // already started a typed chat — saved call/chat rows must not reopen it.
  useChatStore.getState().hydrateSessions({
    activeSessionId: null,
    endedSessions: data.endedSessions ?? [],
    messages: [],
  });
}

/**
 * `profiles.full_name` may not exist yet. Auth metadata still has a full name
 * when it was saved, and we only copy it when it is not just the call name.
 */
async function seedFullNameFromAuth(): Promise<void> {
  if (!isSupabaseConfigured()) return;
  if (useSettingsStore.getState().fullName.trim()) return;
  const supabase = createSupabaseBrowserClient();
  const { data } = await supabase.auth.getUser();
  const meta = data.user?.user_metadata?.full_name;
  if (typeof meta !== "string") return;
  const full = meta.trim();
  if (!full) return;
  const callName = useSettingsStore.getState().learnerName.trim();
  if (full.toLowerCase() === callName.toLowerCase()) return;
  useSettingsStore.getState().setFullName(full);
}

function shouldSkipTokenRefresh(session: Session | null, lastHydratedUserId: string | null): boolean {
  const { checked, dbMode } = useSyncStore.getState();
  const userId = session?.user?.id ?? null;
  return Boolean(
    checked && dbMode && userId && lastHydratedUserId && userId === lastHydratedUserId,
  );
}

/** Password login can fire SIGNED_IN right after mount sync already hydrated this user. */
function shouldSkipSignedInHydrate(
  session: Session | null,
  lastHydratedUserId: string | null,
): boolean {
  const { checked, dbMode } = useSyncStore.getState();
  const userId = session?.user?.id ?? null;
  return Boolean(checked && dbMode && userId && userId === lastHydratedUserId);
}

/**
 * On first mount, ask the server whether this browser is a signed-in user with
 * DB-backed state. If so, overwrite settings and context with the DB truth so
 * a second user sees their own data. The live chat thread is not restored —
 * opening the app starts at the chat gate. When not persisted (local
 * pass-through dev, or signed out), leaves the localStorage-backed stores as-is.
 *
 * Re-runs hydration when auth changes (sign-in / sign-out) without an AppShell
 * remount — e.g. password login via `router.replace`.
 */
export function ServerSync() {
  const markChecked = useSyncStore((s) => s.markChecked);
  const resetChecked = useSyncStore((s) => s.resetChecked);
  const syncGenerationRef = useRef(0);
  const lastHydratedUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    const runSync = async () => {
      const generation = ++syncGenerationRef.current;
      await waitForLocalUserState();
      const data = await fetchServerState();
      if (generation !== syncGenerationRef.current) return;

      if (useSyncStore.getState().signingOut) return;

      applyServerState(data);
      await seedFullNameFromAuth();

      if (generation !== syncGenerationRef.current) return;
      if (useSyncStore.getState().signingOut) return;

      lastHydratedUserIdRef.current =
        data.persisted && data.userId ? data.userId : null;
      markChecked(Boolean(data.persisted));
    };

    const triggerAuthSync = () => {
      if (useSyncStore.getState().signingOut) return;
      resetChecked();
      void runSync();
    };

    void runSync();

    if (!isSupabaseConfigured()) {
      return () => {
        syncGenerationRef.current += 1;
      };
    }

    const supabase = createSupabaseBrowserClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session) => {
      switch (event) {
        case "INITIAL_SESSION":
          return;
        case "TOKEN_REFRESHED":
          if (shouldSkipTokenRefresh(session, lastHydratedUserIdRef.current)) return;
          triggerAuthSync();
          return;
        case "SIGNED_IN":
          if (shouldSkipSignedInHydrate(session, lastHydratedUserIdRef.current)) return;
          triggerAuthSync();
          return;
        case "SIGNED_OUT":
          syncGenerationRef.current += 1;
          lastHydratedUserIdRef.current = null;
          useSyncStore.getState().beginSignOut();
          clearLocalUserState();
          return;
        case "PASSWORD_RECOVERY":
        case "USER_UPDATED":
        case "MFA_CHALLENGE_VERIFIED":
          return;
        default: {
          const _exhaustive: never = event;
          return _exhaustive;
        }
      }
    });

    return () => {
      syncGenerationRef.current += 1;
      subscription.unsubscribe();
    };
  }, [markChecked, resetChecked]);

  return null;
}
