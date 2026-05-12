"use client";

import { useEffect, useState } from "react";

import { useSettingsStore } from "@/stores/useSettingsStore";

export function useSettingsHydrated() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (useSettingsStore.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }
    const unsub = useSettingsStore.persist.onFinishHydration(() =>
      setHydrated(true),
    );
    return unsub;
  }, []);

  return hydrated;
}
