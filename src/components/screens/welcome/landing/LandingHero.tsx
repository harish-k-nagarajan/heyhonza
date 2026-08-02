"use client";

import { useEffect, useState } from "react";

import { HmatOrb } from "@/components/honza/HmatOrb";
import type { HonzaOrbState } from "@/components/honza/theme";
import { ButtonLink } from "@/components/ui/ButtonLink";
import {
  LANDING_HERO_FIRST,
  LANDING_HERO_RETURN,
  LANDING_HERO_SIGNED_OUT,
} from "@/components/screens/welcome/welcome-content";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/cn";
import { TYPE } from "@/lib/design/typography";
import { moodExpression } from "@/lib/mood/expression";

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
        <p className={cn("mt-3 min-h-[1.25rem]", TYPE.kicker, "text-accent")}>
          {visitor.isSignedOut
            ? "NA SHLEDANOU!"
            : moodExpression(mood).czLabel}
        </p>
        {!visitor.isSignedOut ? (
          <p className={TYPE.helper}>{moodExpression(mood).caption}</p>
        ) : null}
      </div>

      <div className="space-y-3">
        <p className={cn(TYPE.label, "text-accent")}>{copy.kicker}</p>
        <h1 className={cn(TYPE.displayLg, "text-foreground")}>
          {headlineLines.map((line, i) => (
            <span key={line}>
              {line}
              {i < headlineLines.length - 1 ? <br /> : null}
            </span>
          ))}
        </h1>
        <p
          className={cn(
            "mx-auto max-w-[340px] md:max-w-[480px]",
            TYPE.subtitle,
            "md:text-[15px]",
          )}
        >
          {copy.subcopy}
        </p>
      </div>

      <div className="hidden w-full max-w-[360px] flex-col items-center gap-3 md:flex">
        <ButtonLink href={ROUTES.signin} shape="pill" size="lg" className="flex w-full">
          {ctaLabel}
        </ButtonLink>
        <p className={cn(TYPE.label, "text-muted-foreground")}>{ctaHint}</p>
      </div>
    </header>
  );
}
