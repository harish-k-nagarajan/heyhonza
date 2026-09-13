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

export function LandingScheduleFold() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const reducedMotion = useReducedMotion();
  const sceneEnabled = !reducedMotion;
  useLandingScheduleScrollScene(sectionRef, sceneEnabled);

  const { t } = useLocale();
  const w = t.welcome;
  const s = t.settings;

  return (
    <section
      ref={sectionRef}
      className="landing-fold landing-fold-schedule flex flex-col items-center gap-6 px-6 py-12 md:gap-7 md:px-10 md:py-14"
    >
      <LandingFoldHeader
        kicker={w.sectionScheduleKicker}
        title={w.sectionScheduleTitle}
      />

      <div
        data-landing-schedule-stage
        className={cn(
          "relative mx-auto w-full max-w-[520px]",
          "flex flex-col items-center gap-2",
          "md:h-[500px]",
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
            "relative z-30 w-full max-w-[360px] will-change-[transform,filter,opacity]",
            "md:absolute md:left-0 md:top-12 md:[transform-style:preserve-3d]",
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
            "relative z-10 mx-auto -mt-10 w-full max-w-[232px] will-change-transform",
            "md:absolute md:left-[248px] md:top-2 md:mt-0 md:mx-0 md:[transform-style:preserve-3d]",
            "max-[480px]:scale-[0.92]",
          )}
          appName={w.scheduleNotificationAppName}
          message={w.schedulePreviewMessage}
          timeLabel={w.scheduleNotificationTime}
        />
      </div>

      <p
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
