"use client";

import { cn } from "@/lib/cn";
import { TYPE } from "@/lib/design/typography";

import { LandingCallFold } from "./LandingCallFold";
import { LandingChatFold } from "./LandingChatFold";
import { LandingFooter } from "./LandingFooter";
import { LandingHero } from "./LandingHero";
import { LandingLevels } from "./LandingLevels";
import { LandingNav } from "./LandingNav";
import { LandingPushNote } from "./LandingPushNote";
import { LandingStickyCta } from "./LandingStickyCta";
import { LandingTopics } from "./LandingTopics";
import { useLandingVisitor } from "./useLandingVisitor";

/** Hmat marketing landing — shown on `/welcome`. */
export function HmatLanding() {
  const visitor = useLandingVisitor();

  if (!visitor.ready) {
    return (
      <div
        className={cn(
          "flex min-h-[50dvh] items-center justify-center uppercase text-muted-foreground",
          TYPE.meta,
        )}
      >
        Loading…
      </div>
    );
  }

  return (
    <>
      <div className="landing-page -mx-5 w-[calc(100%+2.5rem)] overflow-x-clip bg-[#fff8f5] md:-mx-0 md:w-full">
        <LandingNav />
        <LandingHero visitor={visitor} />
        <LandingChatFold />
        <LandingCallFold />

        <div className="landing-supporting flex flex-col gap-12 py-14 md:gap-14 md:py-16">
          <LandingTopics />
          <LandingLevels />
          <LandingPushNote />
        </div>

        <LandingFooter visitor={visitor} />
      </div>

      <LandingStickyCta visitor={visitor} />
    </>
  );
}
