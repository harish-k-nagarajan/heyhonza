"use client";

import { HmatLanding } from "./landing/HmatLanding";

/**
 * Welcome — always the Hmat marketing landing for signed-out visitors. Product
 * copy is English (learners may not read Czech yet); Czech appears only in
 * showcase samples (demo chat, topic lines).
 */
export function WelcomeScreen() {
  return <HmatLanding />;
}
