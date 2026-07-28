"use client";

import { TabScreenTransition } from "@/components/layout/TabScreenTransition";
import { useCallScreen } from "@/hooks/useCallScreen";

import { ClassicCall } from "./ClassicCall";
import { HmatCall } from "./HmatCall";

/**
 * Call selector. Behaviour from `useCallScreen`; picks presentation by design
 * family.
 */
export function CallScreen() {
  const screen = useCallScreen();
  const body =
    screen.family === "hmat" ? (
      <HmatCall screen={screen} />
    ) : (
      <ClassicCall screen={screen} />
    );

  return <TabScreenTransition>{body}</TabScreenTransition>;
}
