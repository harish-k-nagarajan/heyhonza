"use client";

import { useRef, useState } from "react";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { TYPE } from "@/lib/design/typography";

/**
 * Shared Hmat chrome — the header row, the mood badge, and the per-screen
 * loading placeholder. Built once so Home / Chat / Call / Settings stay
 * consistent and both material variants inherit the same structure.
 */

/**
 * File picker in Hmat material + full Czech. The native `::file-selector-button`
 * can be styled but its label ("Choose File") is browser-locale text CSS can't
 * touch — so we hide the input and drive it from a `mat-key` label, showing the
 * chosen filename ourselves. `.txt`/`.md` only, same `onFile` as everywhere.
 */
export function HmatFileInput({
  onFile,
}: {
  onFile: (file: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState<string | null>(null);

  return (
    <div className="flex items-center gap-3">
      <Button
        type="button"
        surface="mat-key"
        shape="pill"
        size="sm"
        onClick={() => inputRef.current?.click()}
      >
        Vybrat soubor
      </Button>
      <span className={cn("min-w-0 flex-1 truncate", TYPE.helper)}>
        {name ?? "Žádný soubor"}
      </span>
      <input
        ref={inputRef}
        type="file"
        accept=".txt,.md,text/plain"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0] ?? null;
          setName(file?.name ?? null);
          onFile(file);
        }}
      />
    </div>
  );
}

export function HmatHeader({
  brand,
  right,
}: {
  brand: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <header className="flex shrink-0 items-center justify-between">
      <span className={cn(TYPE.label, "text-muted-foreground")}>{brand}</span>
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
      <span className={cn(TYPE.kicker, "text-accent")}>{label}</span>
    </span>
  );
}

/** Design-consistent loading state while a screen hydrates. */
export function HmatScreenLoading() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-12">
      <div className="mat-recess flex flex-col items-center px-6 py-6">
        <div className="hmat-orb" style={{ width: 72, height: 72 }}>
          <div className="stack breathe">
            <div className="h-16 w-16 animate-pulse rounded-2xl bg-muted/40" aria-hidden />
          </div>
        </div>
      </div>
      <div className="mat h-3 w-28 animate-pulse rounded-full opacity-50" aria-hidden />
      <p className={cn(TYPE.meta, "uppercase text-muted-foreground")}>Načítání…</p>
    </div>
  );
}
