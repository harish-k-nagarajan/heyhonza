"use client";

import { useOnboardingScreen } from "@/hooks/useOnboardingScreen";

import { ClassicOnboarding } from "./ClassicOnboarding";
import { HmatOnboarding } from "./HmatOnboarding";

/**
 * Onboarding selector. Behaviour from `useOnboardingScreen`; picks presentation
 * by design family.
 */
export function OnboardingScreen() {
  const screen = useOnboardingScreen();
  if (screen.family === "hmat") return <HmatOnboarding screen={screen} />;
  return <ClassicOnboarding screen={screen} />;
}
