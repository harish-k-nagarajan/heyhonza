"use client";

/**
 * Shared Hmat chrome — the header row, the mood badge, and the per-screen
 * loading placeholder. Built once so Home / Chat / Call / Settings stay
 * consistent and both material variants inherit the same structure.
 */

export function HmatHeader({
  brand,
  right,
}: {
  brand: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <header className="flex shrink-0 items-center justify-between">
      <span className="font-display text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        {brand}
      </span>
      {right}
    </header>
  );
}

/** The mood-state pill: a lit dot + the Czech state label, in the mood accent. */
export function HmatBadge({ label }: { label: string }) {
  return (
    <span className="mat inline-flex items-center gap-2 rounded-full px-3 py-1.5">
      <span
        className="h-[7px] w-[7px] rounded-full bg-accent"
        style={{ boxShadow: "0 0 7px var(--accent)" }}
        aria-hidden
      />
      <span className="font-display text-[9px] uppercase tracking-[0.14em] text-accent">
        {label}
      </span>
    </span>
  );
}

/** Design-consistent loading state while a screen hydrates. */
export function HmatScreenLoading() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <p className="font-display text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        Načítání…
      </p>
    </div>
  );
}
