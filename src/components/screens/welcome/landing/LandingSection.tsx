import type { ReactNode } from "react";

import { cn } from "@/lib/cn";
import { TYPE } from "@/lib/design/typography";

export function LandingSectionHeader({
  num,
  title,
  lead,
}: {
  num: string;
  title: string;
  lead: string;
}) {
  return (
    <header className="mb-4 space-y-2">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className={cn(TYPE.meta, "text-muted-foreground")}>{num}</span>
        <h2 className={cn(TYPE.display, "text-foreground")}>{title}</h2>
      </div>
      <p className={cn("max-w-[52ch]", TYPE.subtitle)}>{lead}</p>
    </header>
  );
}

export function LandingSection({
  num,
  title,
  lead,
  children,
}: {
  num: string;
  title: string;
  lead: string;
  children: ReactNode;
}) {
  return (
    <section className="landing-section">
      <LandingSectionHeader num={num} title={title} lead={lead} />
      {children}
    </section>
  );
}
