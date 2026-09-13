"use client";

import { cn } from "@/lib/cn";
import { TYPE } from "@/lib/design/typography";
import { useLocale } from "@/lib/i18n/useLocale";

import { LandingFoldHeader } from "./LandingFoldHeader";
import { LandingIphoneNotificationPreview } from "./LandingIphoneNotificationPreview";
import { LandingScheduleSettingsMock } from "./LandingScheduleSettingsMock";

export function LandingScheduleFold() {
  const { t } = useLocale();
  const w = t.welcome;
  const s = t.settings;

  return (
    <section
      className="landing-fold landing-fold-schedule flex flex-col items-center gap-7 px-6 py-12 md:px-10 md:py-14"
    >
      <LandingFoldHeader
        kicker={w.sectionScheduleKicker}
        title={w.sectionScheduleTitle}
      />

      <div
        className="relative flex w-full max-w-[min(100%,640px)] flex-col items-center justify-center gap-2 md:flex-row md:items-end md:gap-0"
        aria-label={w.schedulePreviewAria}
      >
        <LandingScheduleSettingsMock
          className="relative z-10 max-w-[360px] md:max-w-[340px]"
          hint={s.scheduleHint}
          toggleLabel={s.scheduleSubtitle(2)}
          howOftenLabel={s.scheduleHowOften}
          whenLabel={s.scheduleWhen}
          specificTimeLabel={s.scheduleSpecificTime}
          randomLabel={s.scheduleRandom}
          firstMessageLabel={s.scheduleFirstMessage}
        />

        <LandingIphoneNotificationPreview
          className={cn(
            "relative z-20 -mt-10 md:mt-0 md:-ml-14 md:mb-2",
            "max-[480px]:scale-[0.92]",
          )}
          appName={w.scheduleNotificationAppName}
          message={w.schedulePreviewMessage}
          timeLabel={w.scheduleNotificationTime}
        />
      </div>

      <p className={cn("max-w-[480px] text-center text-[#4A443F]", TYPE.subtitle, "md:text-[14px]")}>
        {w.sectionScheduleLead}
      </p>
    </section>
  );
}
