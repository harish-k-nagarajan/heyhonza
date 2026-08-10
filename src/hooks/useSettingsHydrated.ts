"use client";

import { useSyncExternalStore } from "react";

import { useSettingsStore } from "@/stores/useSettingsStore";

export function useSettingsHydrated() {
  return useSyncExternalStore(
    (onStoreChange) => {
      if (useSettingsStore.persist.hasHydrated()) {
        return () => {};
      }
      return useSettingsStore.persist.onFinishHydration(onStoreChange);
    },
    () => useSettingsStore.persist.hasHydrated(),
    () => false,
  );
}
