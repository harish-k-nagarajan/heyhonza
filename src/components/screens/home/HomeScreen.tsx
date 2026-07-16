"use client";

import { useHomeScreen } from "@/hooks/useHomeScreen";

import { ClassicHome } from "./ClassicHome";
import { HmatHome } from "./HmatHome";

/**
 * Home selector. Behaviour comes from `useHomeScreen`; this picks the
 * presentation for the active design family.
 */
export function HomeScreen() {
  const screen = useHomeScreen();
  if (screen.family === "hmat") return <HmatHome screen={screen} />;
  return <ClassicHome screen={screen} />;
}
