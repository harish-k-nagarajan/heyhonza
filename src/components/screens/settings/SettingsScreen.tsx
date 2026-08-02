"use client";

import { useSettingsScreen } from "@/hooks/useSettingsScreen";

import { ClassicSettings } from "./ClassicSettings";
import { HmatSettings } from "./HmatSettings";

/**
 * Settings — Hmat Metal presentation (`useSettingsScreen`).
 */
export function SettingsScreen() {
  const screen = useSettingsScreen();
  if (screen.family === "hmat") return <HmatSettings screen={screen} />;
  return <ClassicSettings screen={screen} />;
}
