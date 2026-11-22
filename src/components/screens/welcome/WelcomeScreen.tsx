"use client";

import { HmatLanding } from "./landing/HmatLanding";
import { LandingSmoothScroll } from "./landing/LandingSmoothScroll";

/** Welcome — Hmat Metal marketing landing (shipped design). */
export function WelcomeScreen({ githubStars = null }: { githubStars?: number | null }) {
  return (
    <LandingSmoothScroll>
      <HmatLanding githubStars={githubStars} />
    </LandingSmoothScroll>
  );
}
