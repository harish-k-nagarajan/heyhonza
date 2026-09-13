"use client";

import { useReducedMotion } from "motion/react";
import { useRef } from "react";

import { HmatOrb } from "@/components/honza/HmatOrb";
import { HardwareIcon } from "@/components/icons/HardwareIcons";
import {
  LANDING_CALL,
} from "@/components/screens/welcome/welcome-content";
import { cn } from "@/lib/cn";
import { TYPE } from "@/lib/design/typography";
import { useLocale } from "@/lib/i18n/useLocale";

import { LandingFoldHeader } from "./LandingFoldHeader";
import { useLandingCallScrollScene } from "./useLandingCallScrollScene";

export function LandingCallFold() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const reducedMotion = useReducedMotion();
  const sceneEnabled = !reducedMotion;
  useLandingCallScrollScene(sectionRef, sceneEnabled);

  const { t } = useLocale();
  const w = t.welcome;

  return (
    <section
      ref={sectionRef}
      className="landing-fold landing-fold-call flex flex-col items-center gap-7 px-6 py-12 md:px-10 md:py-14"
    >
      <LandingFoldHeader
        num="02"
        kicker={w.sectionCallKicker}
        title={w.sectionCallTitle}
      />

      <div
        data-landing-call-frame
        className={cn(
          "flex w-full max-w-[390px] flex-col items-center gap-5 rounded-[28px] border border-border",
          "bg-white p-7 shadow-[0_12px_32px_rgba(46,125,50,0.08)]",
        )}
      >
        <div data-landing-call-orb className="will-change-transform">
          <HmatOrb state="speaking" size={120} />
        </div>

        <p className={cn(TYPE.label, "text-[#2E7D32]")}>{w.speaking}</p>

        <div className="t-stagger max-w-[320px] text-center">
          <p
            className={cn(
              TYPE.body,
              "t-stagger-line t-stagger-line--1 text-[18px] leading-[1.4] text-foreground",
            )}
          >
            {LANDING_CALL.prompt}
          </p>
        </div>

        <div className="w-full rounded-2xl bg-[#EEFFEE] p-4">
          <p className={cn(TYPE.kicker, "mb-1 text-muted-foreground")}>{w.youSaid}</p>
          <p
            className={cn(
              TYPE.bodySm,
              "t-stream leading-[1.4] text-foreground",
            )}
          >
            {LANDING_CALL.transcript}
          </p>
        </div>

        <div
          data-landing-call-hangup
          className={cn(
            "flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[#2E7D32] text-white will-change-transform",
            sceneEnabled && "md:opacity-40",
          )}
          style={{ transition: `transform var(--duration-fast) var(--ease-smooth-out), opacity var(--duration-fast) var(--ease-smooth-out)` }}
          aria-hidden
        >
          <HardwareIcon name="call" size={28} emboss={false} />
        </div>
      </div>

      <p className={cn("max-w-[480px] text-center", TYPE.subtitle, "md:text-[14px]")}>
        {w.sectionCallLead}
      </p>
    </section>
  );
}
