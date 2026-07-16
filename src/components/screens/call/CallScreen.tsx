"use client";

import { useCallScreen } from "@/hooks/useCallScreen";

import { ClassicCall } from "./ClassicCall";
import { HmatCall } from "./HmatCall";

/**
 * Call selector. Behaviour from `useCallScreen`; picks presentation by design
 * family.
 */
export function CallScreen() {
  const screen = useCallScreen();
  if (screen.family === "hmat") return <HmatCall screen={screen} />;
  return <ClassicCall screen={screen} />;
}
