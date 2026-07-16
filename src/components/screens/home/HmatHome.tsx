"use client";

import { HmatOrb } from "@/components/honza/HmatOrb";
import { HardwareIcon } from "@/components/icons/HardwareIcons";
import type { HomeScreen } from "@/hooks/useHomeScreen";
import { HmatBadge, HmatHeader, HmatScreenLoading } from "@/components/screens/hmat/HmatChrome";

/**
 * Hmat Home — the character leads from a machined recess, the mood accent lights
 * the channel, and Honza's waiting message sits in a brushed-metal card. The
 * reply affordance (composer field + send key) opens Chat, where the learner
 * types; Call lives in the dock. Same behaviour as Classic Home (`useHomeScreen`).
 */
export function HmatHome({ screen }: { screen: HomeScreen }) {
  const { expression, waiting, initiating, lastError } = screen;

  if (!screen.ready) return <HmatScreenLoading />;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <HmatHeader brand="HONZA · 01" right={<HmatBadge label={expression.czLabel} />} />

      {/* Character-first recess. */}
      <div className="mat-recess mt-4 flex flex-col items-center px-4 py-6">
        <HmatOrb state={expression.mood} size={150} />
        <div className="mat-channel mt-5" style={{ width: "60%" }} aria-hidden />
        <p className="mt-3 font-display text-[9px] uppercase tracking-[0.16em] text-accent">
          {initiating ? "Přemýšlí o tobě" : expression.caption}
        </p>
      </div>

      {/* Honza's waiting line. */}
      <div className="mt-5">
        {initiating ? (
          <div className="mat-metal px-5 py-5">
            <p className="font-sans text-[15px] leading-relaxed text-muted-foreground">
              Honza ti právě píše…
            </p>
          </div>
        ) : waiting ? (
          <div className="mat-metal px-5 pb-5 pt-[18px]">
            <p className="mb-2.5 font-display text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
              Honza ti napsal
            </p>
            <p className="font-sans text-[17px] leading-snug text-foreground">
              {waiting.content}
            </p>
          </div>
        ) : lastError ? (
          <div className="mat px-5 py-4">
            <p className="font-sans text-sm leading-relaxed text-accent">{lastError}</p>
            <button
              type="button"
              onClick={screen.retryOpener}
              className="mt-3 font-display text-[10px] uppercase tracking-[0.2em] text-muted-foreground underline"
            >
              Zkusit znovu
            </button>
          </div>
        ) : (
          <div className="mat-metal px-5 py-5">
            <p className="font-sans text-[15px] leading-relaxed text-foreground/85">
              Uč se česky každý den. Honza píše česky — ty odpovídáš česky.
            </p>
          </div>
        )}
      </div>

      <div className="flex-1" />

      {/* Reply affordance → opens Chat. Call lives in the dock. */}
      <div className="mt-5 flex items-center gap-2.5">
        <button
          type="button"
          onClick={screen.goChat}
          className="mat-field press flex-1 px-[18px] py-3.5 text-left font-sans text-[15px] text-muted-foreground"
        >
          {waiting ? "Odpověz Honzovi" : "Napiš česky"}
          <span className="text-accent">_</span>
        </button>
        <button
          type="button"
          onClick={screen.goChat}
          aria-label={waiting ? "Reply to Honza" : "Open chat"}
          className="mat-key press flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full text-accent"
        >
          <HardwareIcon name="send" size={22} />
        </button>
      </div>
    </div>
  );
}
