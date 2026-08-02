import { LEVEL_OPTIONS } from "@/lib/constants";
import {
  LANDING_LEVEL_IDS,
  LEVEL_LANDING_BLURBS,
} from "@/components/screens/welcome/welcome-content";
import { cn } from "@/lib/cn";
import { TYPE } from "@/lib/design/typography";

export function LandingLevels() {
  return (
    <div className="landing-panel">
      <div className="landing-level-rail">
        {LANDING_LEVEL_IDS.map((id) => {
          const option = LEVEL_OPTIONS.find((l) => l.id === id);
          const blurb = LEVEL_LANDING_BLURBS[id];

          return (
            <div key={id} className="landing-level-step mat-metal rounded-[16px] px-4 py-3">
              <p className={cn(TYPE.label, "text-accent")}>{option?.label ?? id}</p>
              <p className={cn("mt-1", TYPE.bodySm, "text-foreground")}>{blurb}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
