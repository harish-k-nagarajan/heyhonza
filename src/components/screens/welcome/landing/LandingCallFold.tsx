import { HmatOrb } from "@/components/honza/HmatOrb";
import { HardwareIcon } from "@/components/icons/HardwareIcons";
import {
  LANDING_CALL,
  LANDING_SECTIONS,
} from "@/components/screens/welcome/welcome-content";
import { cn } from "@/lib/cn";
import { TYPE } from "@/lib/design/typography";

import { LandingFoldHeader } from "./LandingFoldHeader";

export function LandingCallFold() {
  const section = LANDING_SECTIONS.call;

  return (
    <section className="landing-fold landing-fold-call flex flex-col items-center gap-7 px-6 py-12 md:px-10 md:py-14">
      <LandingFoldHeader
        num={section.num}
        kicker={section.kicker}
        title={section.title}
      />

      <div
        className={cn(
          "flex w-full max-w-[390px] flex-col items-center gap-5 rounded-[28px] border border-border",
          "bg-white p-7 shadow-[0_12px_32px_rgba(46,125,50,0.08)]",
        )}
      >
        <HmatOrb state="speaking" size={120} />

        <p className={cn(TYPE.label, "text-[#2E7D32]")}>speaking</p>

        <p className={cn(TYPE.body, "max-w-[320px] text-center text-[18px] leading-[1.4] text-foreground")}>
          {LANDING_CALL.prompt}
        </p>

        <div className="w-full rounded-2xl bg-[#EEFFEE] p-4">
          <p className={cn(TYPE.kicker, "mb-1 text-muted-foreground")}>YOU SAID</p>
          <p className={cn(TYPE.bodySm, "leading-[1.4] text-foreground")}>
            {LANDING_CALL.transcript}
          </p>
        </div>

        <div
          className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[#2E7D32] text-white"
          aria-hidden
        >
          <HardwareIcon name="call" size={28} emboss={false} />
        </div>
      </div>

      <p className={cn("max-w-[480px] text-center", TYPE.subtitle, "md:text-[14px]")}>
        {section.lead}
      </p>
    </section>
  );
}
