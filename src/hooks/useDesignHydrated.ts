"use client";

import { useEffect, useState } from "react";

import { useDesignStore } from "@/stores/useDesignStore";

/**
 * True once the persisted design store has rehydrated from `localStorage`.
 * Screens gate their first render on this (alongside settings hydration) so
 * Home doesn't flash the Classic default before the real design resolves on a
 * cold load.
 */
export function useDesignHydrated() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (useDesignStore.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }
    const unsub = useDesignStore.persist.onFinishHydration(() => setHydrated(true));
    return unsub;
  }, []);

  return hydrated;
}
