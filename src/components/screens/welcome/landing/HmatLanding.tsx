"use client";

import { LANDING_SECTIONS } from "@/components/screens/welcome/welcome-content";

import { LandingDemoChat } from "./LandingDemoChat";
import { LandingFooter } from "./LandingFooter";
import { LandingHero } from "./LandingHero";
import { LandingLevels } from "./LandingLevels";
import { LandingSection } from "./LandingSection";
import { LandingSteps } from "./LandingSteps";
import { LandingStickyCta } from "./LandingStickyCta";
import { LandingTopics } from "./LandingTopics";
import { useLandingVisitor } from "./useLandingVisitor";

/** Hmat marketing landing — shown on `/welcome` when the saved design is Hmat. */
export function HmatLanding() {
  const visitor = useLandingVisitor();

  if (!visitor.ready) {
    return (
      <div className="flex min-h-[50dvh] items-center justify-center font-display text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        Loading…
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto w-full max-w-[430px] md:max-w-none">
        <LandingHero visitor={visitor} />

        <LandingSection {...LANDING_SECTIONS.demo}>
          <LandingDemoChat />
        </LandingSection>

        <LandingSection {...LANDING_SECTIONS.topics}>
          <LandingTopics />
        </LandingSection>

        <LandingSection {...LANDING_SECTIONS.levels}>
          <LandingLevels />
        </LandingSection>

        <LandingSection {...LANDING_SECTIONS.steps}>
          <LandingSteps />
        </LandingSection>

        <LandingFooter />
      </div>

      <LandingStickyCta visitor={visitor} />
    </>
  );
}
