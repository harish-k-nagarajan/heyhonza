"use client";

import { useHomeScreen } from "@/hooks/useHomeScreen";

import { ClassicHome } from "./ClassicHome";

/**
 * Home selector. Behaviour comes from `useHomeScreen`; this picks the
 * presentation for the active design family. Phase 4 adds the Hmat branch —
 * until then every family renders Classic.
 */
export function HomeScreen() {
  const screen = useHomeScreen();
  return <ClassicHome screen={screen} />;
}
