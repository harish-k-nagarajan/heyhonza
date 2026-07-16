"use client";

import { useCallScreen } from "@/hooks/useCallScreen";

import { ClassicCall } from "./ClassicCall";

/**
 * Call selector. Behaviour from `useCallScreen`; picks presentation by design
 * family. Phase 4 adds the Hmat branch.
 */
export function CallScreen() {
  const screen = useCallScreen();
  return <ClassicCall screen={screen} />;
}
