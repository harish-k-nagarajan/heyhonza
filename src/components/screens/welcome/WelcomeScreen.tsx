"use client";

import { HmatLanding } from "./landing/HmatLanding";
import { LandingSmoothScroll } from "./landing/LandingSmoothScroll";

/** Welcome — Hmat Metal marketing landing (shipped design). */
export function WelcomeScreen() {
  return (
    <LandingSmoothScroll>
      <HmatLanding />
    </LandingSmoothScroll>
  );
}
