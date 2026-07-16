"use client";

import { useDesignHydrated } from "@/hooks/useDesignHydrated";
import { useSettingsHydrated } from "@/hooks/useSettingsHydrated";
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
