"use client";

import { usePathname } from "next/navigation";

import { useDesignHydrated } from "@/hooks/useDesignHydrated";
import { useMoodExpression } from "@/hooks/useMoodExpression";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/cn";
import { DESIGNS } from "@/lib/design/registry";
import { useDesignStore } from "@/stores/useDesignStore";

import { BottomNav } from "./BottomNav";
import { HmatDock } from "./HmatDock";
import { HmatScreenFrame } from "./HmatScreenFrame";
import { ServerSync } from "./ServerSync";

/** Hmat landing runs at excited-level energy so the channel and orb feel alive. */
const LANDING_ENERGY = 0.85;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const expression = useMoodExpression();
  const design = useDesignStore((s) => s.design);
  const designHydrated = useDesignHydrated();
  const family = DESIGNS[design].family;

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

  // The app-wide mood expression drives the surface tint, the `--accent` custom
  // property, the `--energy` scalar, and `--bg` (the mood background as a var,
  // which the Hmat material system tints off). ~400ms so swaps read as one
  // coherent change; reduced-motion neutralises it via globals.css.
  const rootStyle = {
    backgroundColor: expression.background,
    ["--accent" as string]: expression.accent,
    ["--energy" as string]: isWelcome && isHmat ? LANDING_ENERGY : expression.energy,
    ["--bg" as string]: expression.background,
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
          "transition-[background-color] duration-[400ms] [transition-timing-function:var(--td-ease-smooth-out)]",
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
              paddingBottom: hideNav ? welcomeBottomPad : "calc(88px + env(safe-area-inset-bottom))",
            }}
          >
            {hideNav || isWelcome ? children : <HmatScreenFrame>{children}</HmatScreenFrame>}
          </div>
        </div>
        {!hideNav ? <HmatDock /> : null}
        <ServerSync />
      </div>
    );
  }

  return (
    <div
      className="min-h-dvh transition-[background-color] duration-[400ms] [transition-timing-function:var(--td-ease-smooth-out)]"
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
