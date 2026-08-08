"use client";

import { cn } from "@/lib/cn";
import { TYPE } from "@/lib/design/typography";
import { useLocale } from "@/lib/i18n/useLocale";

export function LandingPushNote() {
  const { t } = useLocale();
  const w = t.welcome;

  return (
    <section className="px-6 md:px-10">
      <div className="rounded-[20px] border border-border bg-[#FFF4EE] p-5">
        <p className={cn(TYPE.label, "text-muted-foreground")}>
          {w.pushKicker}
        </p>
        <p className={cn("mt-2 max-w-[52ch]", TYPE.bodySm, "leading-[1.5] text-foreground")}>
          {w.pushBody}
        </p>
      </div>
    </section>
  );
}
