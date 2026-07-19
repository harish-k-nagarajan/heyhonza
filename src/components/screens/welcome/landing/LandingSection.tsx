import type { ReactNode } from "react";

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
        <span className="font-display text-[11px] tracking-[0.14em] text-muted-foreground">
          {num}
        </span>
        <h2 className="font-display text-xl tracking-[0.02em] text-foreground md:text-2xl">
          {title}
        </h2>
      </div>
      <p className="max-w-[52ch] font-sans text-sm leading-relaxed text-muted-foreground">
        {lead}
      </p>
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
