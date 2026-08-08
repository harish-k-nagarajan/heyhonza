"use client";

import {
  LANDING_LEVEL_IDS,
} from "@/components/screens/welcome/welcome-content";
import type { LevelId } from "@/lib/constants";
import { cn } from "@/lib/cn";
import { TYPE } from "@/lib/design/typography";
import { useLocale } from "@/lib/i18n/useLocale";

import { LandingFoldHeader } from "./LandingFoldHeader";

export function LandingLevels() {
  const { t } = useLocale();
  const w = t.welcome;

  return (
    <section className="flex flex-col gap-5 px-6 md:px-10">
      <LandingFoldHeader
        num="04"
        kicker={w.sectionLevelsKicker}
        title={w.sectionLevelsTitle}
        lead={w.sectionLevelsLead}
        className="items-start text-left"
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {LANDING_LEVEL_IDS.map((id) => {
          const blurb = t.levels.blurb[id as LevelId];

          return (
            <article
              key={id}
              className="rounded-[20px] border border-border bg-white p-4"
            >
              <p className={cn(TYPE.label, "text-accent")}>{id}</p>
              <p className={cn("mt-1.5", TYPE.bodySm, "leading-[1.35] text-muted-foreground")}>
                {blurb}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
