"use client";

import { TabScreenTransition } from "@/components/layout/TabScreenTransition";
import { useSettingsScreen } from "@/hooks/useSettingsScreen";

import { ClassicSettings } from "./ClassicSettings";
import { HmatSettings } from "./HmatSettings";

/**
 * Settings selector. Behaviour from `useSettingsScreen`; picks presentation by
 * design family. Both host the shared Design Lab.
 */
export function SettingsScreen() {
  const screen = useSettingsScreen();
  const body =
    screen.family === "hmat" ? (
      <HmatSettings screen={screen} />
    ) : (
      <ClassicSettings screen={screen} />
    );

  return <TabScreenTransition>{body}</TabScreenTransition>;
}
