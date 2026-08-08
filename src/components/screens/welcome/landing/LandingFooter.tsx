"use client";

import { cn } from "@/lib/cn";
import { TYPE } from "@/lib/design/typography";
import { useLocale } from "@/lib/i18n/useLocale";

import { LandingAuthButtons } from "./LandingAuthButtons";
import type { LandingVisitor } from "./useLandingVisitor";

export function LandingFooter({ visitor }: { visitor: LandingVisitor }) {
  const { t } = useLocale();
  const w = t.welcome;

  return (
    <footer className="landing-fold-footer flex flex-col items-center gap-5 px-6 pb-16 pt-14 text-center md:px-10 md:pb-20">
      <h2 className={cn(TYPE.display, "max-w-[480px] text-[28px] text-foreground")}>
        {w.footerHeadline}
      </h2>

      <LandingAuthButtons visitor={visitor} />

      <p className={cn("max-w-[420px]", TYPE.bodySm, "leading-[1.5] text-muted-foreground")}>
        {w.footerNote}
      </p>
    </footer>
  );
}
