"use client";

import { HmatPresenceRecess } from "@/components/screens/hmat/HmatUi";
import {
  LANDING_HERO_BUBBLES,
} from "@/components/screens/welcome/welcome-content";
import { cn } from "@/lib/cn";
import { TYPE } from "@/lib/design/typography";
import { useLocale } from "@/lib/i18n/useLocale";
import { isShowcaseMode } from "@/lib/site-mode";

import { LandingAuthButtons, LandingCtaHint } from "./LandingAuthButtons";
import {
  LandingHeroHeadlineScanner,
  useLandingBubbleMorph,
} from "./LandingBubbleMorphContext";
import { LandingChatBubble } from "./LandingChatBubble";
import type { LandingVisitor } from "./useLandingVisitor";

export function LandingHero({
  visitor,
  githubStars = null,
}: {
  visitor: LandingVisitor;
  githubStars?: number | null;
}) {
  const morph = useLandingBubbleMorph();
  const { t } = useLocale();
  const w = t.welcome;
  const copy = visitor.isSignedOut
    ? {
        headline: w.signedOutHeadline,
        subcopy: w.signedOutSubcopy,
      }
    : {
        headline: w.heroHeadline,
        subcopy: w.heroSubcopy,
      };

  return (
    <section className="landing-fold landing-fold-hero relative flex flex-col">
      <div className="relative mx-auto w-full max-w-[880px] flex-1 px-6 md:px-10">
        <div
          ref={morph?.orbitRef}
          className="relative z-20 mx-auto h-[min(420px,max(280px,52vw))] max-h-[480px] w-full"
        >
          {LANDING_HERO_BUBBLES.map((bubble, index) => (
            <div
              key={bubble.text}
              className={cn(
                "landing-float-bubble absolute z-[12]",
                bubble.className,
              )}
              style={{ animationDelay: `${index * -1.75}s` }}
            >
              <LandingChatBubble
                role={bubble.role}
                messageIndex={index}
                morphAnchor="hero"
              >
                {bubble.text}
              </LandingChatBubble>
            </div>
          ))}

          <div className="absolute left-1/2 top-1/2 z-[10] -translate-x-1/2 -translate-y-1/2">
            <HmatPresenceRecess orbState="idle" variant="display" />
          </div>
        </div>

        <LandingHeroHeadlineScanner className="relative z-[1] mt-8 flex flex-col items-center gap-4 pb-10 text-center">
          <h1
            className={cn(
              TYPE.displayLg,
              "w-full text-balance text-foreground md:max-w-[720px] md:text-[34px]",
            )}
          >
            {copy.headline}
          </h1>
          <p
            className={cn(
              "max-w-[36ch] text-pretty md:max-w-[42ch]",
              TYPE.subtitle,
              "text-[15px] leading-[1.5] md:text-[15px]",
            )}
          >
            {copy.subcopy}
          </p>

          {isShowcaseMode() ? null : (
            <div className="mt-2 flex flex-col items-center gap-7">
              <LandingAuthButtons visitor={visitor} githubStars={githubStars} />
              <LandingCtaHint visitor={visitor} />
            </div>
          )}
        </LandingHeroHeadlineScanner>
      </div>
    </section>
  );
}
