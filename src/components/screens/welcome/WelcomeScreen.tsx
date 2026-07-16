"use client";

import { DESIGNS } from "@/lib/design/registry";
import { useDesignStore } from "@/stores/useDesignStore";

import { ClassicWelcome } from "./ClassicWelcome";
import { HmatWelcome } from "./HmatWelcome";

/**
 * Welcome selector — picks the front door for the active design family. A
 * returning user keeps their saved design even signed out (the pre-paint script
 * has already themed the page), so Hmat users land on the Hmat welcome.
 */
export function WelcomeScreen() {
  const design = useDesignStore((s) => s.design);
  if (DESIGNS[design].family === "hmat") return <HmatWelcome />;
  return <ClassicWelcome />;
}
