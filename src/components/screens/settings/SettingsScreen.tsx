"use client";

import { useSettingsScreen } from "@/hooks/useSettingsScreen";

import { ClassicSettings } from "./ClassicSettings";
import { HmatSettings } from "./HmatSettings";

/**
 * Settings selector. Behaviour from `useSettingsScreen`; picks presentation by
 * design family. Both host the shared Design Lab.
 */
export function SettingsScreen() {
  const screen = useSettingsScreen();
  if (screen.family === "hmat") return <HmatSettings screen={screen} />;
  return <ClassicSettings screen={screen} />;
}
