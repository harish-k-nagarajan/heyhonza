"use client";

import { useReducedMotion } from "motion/react";
import { useRef } from "react";

import { cn } from "@/lib/cn";
import { TYPE } from "@/lib/design/typography";
import { useLocale } from "@/lib/i18n/useLocale";

import { LandingFoldHeader } from "./LandingFoldHeader";
import { LandingIphoneNotificationPreview } from "./LandingIphoneNotificationPreview";
import { LandingScheduleSettingsMock } from "./LandingScheduleSettingsMock";
import { useLandingScheduleScrollScene } from "./useLandingScheduleScrollScene";
import { useScheduleFoldFit } from "./useScheduleFoldFit";

export function LandingScheduleFold() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const reducedMotion = useReducedMotion();
  const sceneEnabled = !reducedMotion;
  const compactLayout = useScheduleFoldFit(sectionRef);
  useLandingScheduleScrollScene(sectionRef, sceneEnabled);

  const { t } = useLocale();
  const w = t.welcome;
  const s = t.settings;

  return (
    <section
      ref={sectionRef}
      data-schedule-layout={compactLayout}
      className="landing-fold landing-fold-schedule flex flex-col items-center gap-3 px-5 pb-3 pt-6 md:gap-7 md:px-10 md:py-14"
    >
      <LandingFoldHeader
        kicker={w.sectionScheduleKicker}
        title={w.sectionScheduleTitle}
      />

      <div
        data-landing-schedule-stage
        className={cn(
          "relative mx-auto flex w-full max-w-[520px] flex-col items-center",
          "md:h-[500px] md:gap-2",
          "md:[perspective:1400px] md:[transform-style:preserve-3d]",
        )}
        aria-label={w.schedulePreviewAria}
      >
        <div
          className="pointer-events-none absolute inset-0 hidden rounded-[32px] bg-gradient-to-b from-transparent via-white/40 to-transparent md:block"
          aria-hidden
        />

        <div
          data-landing-schedule-settings
          className={cn(
            "relative z-30 w-full max-w-[360px]",
            "md:absolute md:left-0 md:top-12 md:[transform-style:preserve-3d] md:will-change-[transform,filter,opacity]",
          )}
        >
          <LandingScheduleSettingsMock
            className="w-full max-w-[360px]"
            hint={w.schedulePreviewHint}
            toggleLabel={s.scheduleSubtitle(2)}
            howOftenLabel={s.scheduleHowOften}
            whenLabel={s.scheduleWhen}
            specificTimeLabel={s.scheduleSpecificTime}
            randomLabel={s.scheduleRandom}
            firstMessageLabel={s.scheduleFirstMessage}
          />
        </div>

        <LandingIphoneNotificationPreview
          data-landing-schedule-phone
          notifyOpen={!sceneEnabled}
          className={cn(
            "relative z-10 mx-auto shrink-0",
            "md:absolute md:left-[248px] md:top-2 md:mx-0 md:w-auto md:max-w-[232px] md:[transform-style:preserve-3d] md:will-change-transform",
          )}
          appName={w.scheduleNotificationAppName}
          message={w.schedulePreviewMessage}
          timeLabel={w.scheduleNotificationTime}
        />
      </div>

      <p
        data-landing-schedule-lead
        className={cn(
          "max-w-[42ch] text-pretty text-center text-[#4A443F]",
          TYPE.subtitle,
          "md:max-w-[46ch] md:text-[14px]",
        )}
      >
        {w.sectionScheduleLead}
      </p>
    </section>
  );
}
