"use client";

import { useDesignHydrated } from "@/hooks/useDesignHydrated";
import { useSettingsHydrated } from "@/hooks/useSettingsHydrated";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { useSyncStore } from "@/stores/useSyncStore";

/**
 * The shared readiness gate for every signed-in screen. A screen is ready to
 * paint real content only once all three local sources have resolved:
 *
 *   - settings store hydrated (level, topics, onboarding flag, context)
 *   - server sync checked (DB truth vs local pass-through)
 *   - **design store hydrated** — without this, a Hmat user's Home paints Classic
 *     for a frame on cold load before the saved design resolves.
 *
 * Behaviour hooks build on this so a design can stay pure presentation.
 */
export function useScreenReady(): boolean {
  const settingsHydrated = useSettingsHydrated();
  const designHydrated = useDesignHydrated();
  const serverChecked = useSyncStore((s) => s.checked);
  return settingsHydrated && designHydrated && serverChecked;
}

/**
 * Send a learner to `/onboarding` only when they still need first-run setup.
 * Signed-out Supabase sessions must not bounce there (sign-out clears local
 * flags; the marketing `/welcome` page is the front door).
 */
export function useNeedsOnboarding(): boolean {
  const ready = useScreenReady();
  const onboardingComplete = useSettingsStore((s) => s.onboardingComplete);
  const dbMode = useSyncStore((s) => s.dbMode);
  const signingOut = useSyncStore((s) => s.signingOut);
  if (signingOut || !ready || onboardingComplete) return false;
  if (!isSupabaseConfigured()) return true;
  return dbMode;
}
