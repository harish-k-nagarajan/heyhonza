"use client";

import { HmatOrb } from "@/components/honza/HmatOrb";
import {
  LANDING_HERO_BUBBLES,
  LANDING_HERO_FIRST,
  LANDING_HERO_SIGNED_OUT,
} from "@/components/screens/welcome/welcome-content";
import { cn } from "@/lib/cn";
import { TYPE } from "@/lib/design/typography";

import { LandingAuthButtons, LandingCtaHint } from "./LandingAuthButtons";
import { LandingChatBubble } from "./LandingChatBubble";
import type { LandingVisitor } from "./useLandingVisitor";

export function LandingHero({ visitor }: { visitor: LandingVisitor }) {
  const copy = visitor.isSignedOut ? LANDING_HERO_SIGNED_OUT : LANDING_HERO_FIRST;

  return (
    <section className="landing-fold landing-fold-hero relative flex min-h-[min(820px,100dvh)] flex-col">
      <div className="relative mx-auto w-full max-w-[880px] flex-1 px-6 md:px-10">
        <div className="relative mx-auto h-[min(420px,52vw)] max-h-[480px] w-full">
          {LANDING_HERO_BUBBLES.map((bubble) => (
            <div
              key={bubble.text}
              className={cn(
                "landing-float-bubble absolute hidden max-w-[220px] md:block",
                bubble.className,
              )}
            >
              <LandingChatBubble role={bubble.role}>{bubble.text}</LandingChatBubble>
            </div>
          ))}

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <HmatOrb state="idle" size={148} />
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-4 pb-10 text-center">
          <h1
            className={cn(
              TYPE.displayLg,
              "max-w-[720px] text-foreground md:text-[34px]",
            )}
          >
            {copy.headline}
          </h1>
          <p
            className={cn(
              "max-w-[720px]",
              TYPE.subtitle,
              "text-[15px] leading-[1.5] md:text-[15px]",
            )}
          >
            {copy.subcopy}
          </p>

          <div className="mt-2 flex flex-col items-center gap-7">
            <LandingAuthButtons visitor={visitor} />
            <LandingCtaHint visitor={visitor} />
          </div>
        </div>
      </div>
    </section>
  );
}
