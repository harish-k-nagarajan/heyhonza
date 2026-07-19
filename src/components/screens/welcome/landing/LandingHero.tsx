"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { HmatOrb } from "@/components/honza/HmatOrb";
import type { HonzaOrbState } from "@/components/honza/theme";
import {
  LANDING_HERO_FIRST,
  LANDING_HERO_RETURN,
  LANDING_HERO_SIGNED_OUT,
} from "@/components/screens/welcome/welcome-content";
import { ROUTES } from "@/lib/constants";

import type { LandingVisitor } from "./useLandingVisitor";

const HERO_MOODS: HonzaOrbState[] = ["idle", "thinking", "excited"];

export function LandingHero({ visitor }: { visitor: LandingVisitor }) {
  const [moodIndex, setMoodIndex] = useState(0);
  const mood = HERO_MOODS[moodIndex] ?? "excited";

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const id = window.setInterval(() => {
      setMoodIndex((i) => (i + 1) % HERO_MOODS.length);
    }, 4200);
    return () => window.clearInterval(id);
  }, []);

  const copy = visitor.isSignedOut
    ? LANDING_HERO_SIGNED_OUT
    : visitor.isReturn
      ? LANDING_HERO_RETURN[visitor.returnIndex % LANDING_HERO_RETURN.length]
      : LANDING_HERO_FIRST;

  const ctaLabel = visitor.isSignedOut ? LANDING_HERO_SIGNED_OUT.cta : LANDING_HERO_FIRST.cta;
  const ctaHint = visitor.isSignedOut ? LANDING_HERO_SIGNED_OUT.ctaHint : LANDING_HERO_FIRST.ctaHint;

  const headlineLines = copy.headline.split("\n");

  return (
    <header className="flex flex-col items-center gap-6 pb-2 text-center">
      <div className="mat-recess mt-1 flex w-full flex-col items-center px-4 py-8 md:py-10">
        <HmatOrb state={mood} size={148} />
        <div className="mat-channel mt-6" style={{ width: "62%" }} aria-hidden />
        <p className="mt-3 min-h-[1.25rem] font-display text-[9px] uppercase tracking-[0.16em] text-accent">
          {visitor.isSignedOut
            ? "NA SHLEDANOU!"
            : mood === "excited"
              ? "NICE!"
              : mood === "thinking"
                ? "THINKING…"
                : "WAITING FOR YOU"}
        </p>
      </div>

      <div className="space-y-3">
        <p className="font-display text-[10px] uppercase tracking-[0.2em] text-accent">
          {copy.kicker}
        </p>
        <h1 className="font-display text-[28px] leading-tight tracking-[0.04em] text-foreground md:text-[34px]">
          {headlineLines.map((line, i) => (
            <span key={line}>
              {line}
              {i < headlineLines.length - 1 ? <br /> : null}
            </span>
          ))}
        </h1>
        <p className="mx-auto max-w-[340px] font-sans text-[14px] leading-relaxed text-muted-foreground md:max-w-[480px] md:text-[15px]">
          {copy.subcopy}
        </p>
      </div>

      <div className="hidden w-full max-w-[360px] flex-col items-center gap-3 md:flex">
        <Link
          href={ROUTES.signin}
          className="mat-key press flex w-full items-center justify-center rounded-full py-3.5 font-display text-xs uppercase tracking-[0.2em] text-accent"
        >
          {ctaLabel}
        </Link>
        <p className="font-display text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          {ctaHint}
        </p>
      </div>
    </header>
  );
}
