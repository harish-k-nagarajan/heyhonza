import { LEVEL_OPTIONS } from "@/lib/constants";
import {
  LANDING_LEVEL_IDS,
  LANDING_SECTIONS,
  LEVEL_LANDING_BLURBS,
} from "@/components/screens/welcome/welcome-content";
import { cn } from "@/lib/cn";
import { TYPE } from "@/lib/design/typography";

import { LandingFoldHeader } from "./LandingFoldHeader";

export function LandingLevels() {
  const section = LANDING_SECTIONS.levels;

  return (
    <section className="flex flex-col gap-5 px-6 md:px-10">
      <LandingFoldHeader
        num={section.num}
        kicker={section.kicker}
        title={section.title}
        lead={section.lead}
        className="items-start text-left"
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {LANDING_LEVEL_IDS.map((id) => {
          const option = LEVEL_OPTIONS.find((level) => level.id === id);
          const blurb = LEVEL_LANDING_BLURBS[id];

          return (
            <article
              key={id}
              className="rounded-[20px] border border-border bg-white p-4"
            >
              <p className={cn(TYPE.label, "text-accent")}>{option?.id ?? id}</p>
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
