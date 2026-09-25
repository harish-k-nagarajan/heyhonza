"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { CREAM_CANVAS } from "@/components/honza/theme";
import { useDesignHydrated } from "@/hooks/useDesignHydrated";
import { useMoodExpression } from "@/hooks/useMoodExpression";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/cn";
import { DESIGNS } from "@/lib/design/registry";
import { displayTabHref, isHmatMainTab } from "@/lib/hmat-tabs";
import { useDesignStore } from "@/stores/useDesignStore";
import { useTabNavStore } from "@/stores/useTabNavStore";

import { BottomNav } from "./BottomNav";
import { HmatDock } from "./HmatDock";
import { HmatScreenFrame } from "./HmatScreenFrame";
import { HmatTabStage } from "./HmatTabStage";
import { ServerSync } from "./ServerSync";

/** Hmat landing runs at excited-level energy so the channel and orb feel alive. */
const LANDING_ENERGY = 0.85;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const pendingHref = useTabNavStore((s) => s.pendingHref);
  const expression = useMoodExpression();
  const design = useDesignStore((s) => s.design);
  const designHydrated = useDesignHydrated();
  const family = DESIGNS[design].family;
  const tabHref = displayTabHref(pathname, pendingHref);
  const useTabStage = isHmatMainTab(tabHref);

  const isWelcome = pathname.startsWith(ROUTES.welcome);
  const isHmat = family === "hmat" && designHydrated;

  // Pre-app surfaces: no tab bar. On `/welcome` the visitor isn't signed in at
  // all, so nav would only offer links that bounce straight back to sign-in.
  const hideNav =
    pathname.startsWith(ROUTES.onboarding) ||
    pathname.startsWith(ROUTES.signup) ||
    pathname.startsWith(ROUTES.login) ||
    pathname.startsWith(ROUTES.signin) ||
    isWelcome;

  // Cream canvas stays put. Mood travels on --accent / --energy (face, WAITING,
  // channel, dock pill, composer). Recess mood fills use --recess-g*.
  const rootStyle = {
    backgroundColor: CREAM_CANVAS,
    ["--accent" as string]: expression.accent,
    ["--energy" as string]: isWelcome && isHmat ? LANDING_ENERGY : expression.energy,
    ["--bg" as string]: CREAM_CANVAS,
  };

  if (isHmat) {
    const stageMax = isWelcome ? "max-w-landing" : "max-w-app";
    const welcomeBottomPad = isWelcome
      ? "calc(88px + env(safe-area-inset-bottom))"
      : "calc(28px + env(safe-area-inset-bottom))";
    const stageHeight = isWelcome ? "min-h-dvh" : "h-dvh overflow-hidden";

    return (
      <div
        className={cn(
          "transition-colors duration-[400ms] ease-out",
          isWelcome ? "min-h-dvh" : "h-dvh overflow-hidden",
        )}
        style={rootStyle}
        data-mood={expression.mood}
      >
        <div className={`relative mx-auto flex ${stageHeight} ${stageMax} flex-col`}>
          {!isWelcome ? <div className="mat-bg" aria-hidden /> : null}
          <div
            className={cn(
              "relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden",
              isWelcome ? "px-5 pt-0" : "px-5",
            )}
            style={{
              paddingTop: isWelcome
                ? "env(safe-area-inset-top)"
                : "max(20px, env(safe-area-inset-top))",
              paddingBottom: hideNav ? welcomeBottomPad : "calc(96px + env(safe-area-inset-bottom))",
            }}
          >
            {hideNav || isWelcome ? (
              children
            ) : (
              <HmatScreenFrame frameKey={useTabStage ? tabHref : pathname}>
                {useTabStage ? <HmatTabStage /> : children}
              </HmatScreenFrame>
            )}
          </div>
        </div>
        {!hideNav ? <HmatDock /> : null}
        <ServerSync />
      </div>
    );
  }

  return (
    <div
      className="min-h-dvh transition-colors duration-[400ms] ease-out"
      style={rootStyle}
      data-mood={expression.mood}
    >
      <div
        className={`mx-auto min-h-dvh max-w-app px-4 ${hideNav ? "pb-10 pt-10" : "pb-28 pt-6"}`}
        style={{ paddingTop: "max(24px, env(safe-area-inset-top))" }}
      >
        {children}
      </div>
      {!hideNav && designHydrated ? <BottomNav /> : null}
      <ServerSync />
    </div>
  );
}
