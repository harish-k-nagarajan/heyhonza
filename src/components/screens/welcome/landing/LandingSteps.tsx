"use client";

import { HardwareIcon } from "@/components/icons/HardwareIcons";
import { cn } from "@/lib/cn";
import { TYPE } from "@/lib/design/typography";
import { useLocale } from "@/lib/i18n/useLocale";

const STEP_ICONS = ["home", "send", "chat"] as const;

export function LandingSteps() {
  const { t } = useLocale();
  const steps = t.welcome.steps;

  return (
    <div className="grid gap-3 md:grid-cols-3">
      {steps.map((step, index) => {
        const icon = STEP_ICONS[index] ?? "chat";
        return (
          <article
            key={step.n}
            className="landing-panel flex flex-col gap-3 text-left md:min-h-[168px]"
          >
            <div className="flex items-center gap-3">
              <span className="mat-key flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-accent">
                <HardwareIcon name={icon} size={18} />
              </span>
              <span className={cn(TYPE.meta, "text-accent")}>{step.n}</span>
            </div>
            <div className="space-y-1.5">
              <h3 className={cn(TYPE.body, "font-medium text-foreground")}>{step.title}</h3>
              <p className={TYPE.subtitle}>{step.body}</p>
            </div>
          </article>
        );
      })}
    </div>
  );
}
