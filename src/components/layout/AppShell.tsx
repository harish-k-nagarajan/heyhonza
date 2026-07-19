"use client";

import { usePathname } from "next/navigation";

import { useDesignHydrated } from "@/hooks/useDesignHydrated";
import { useMoodExpression } from "@/hooks/useMoodExpression";
import { ROUTES } from "@/lib/constants";
import { DESIGNS } from "@/lib/design/registry";
import type { DesignId } from "@/lib/design/registry";
import { useDesignStore } from "@/stores/useDesignStore";

import { BottomNav } from "./BottomNav";
import { HmatDock } from "./HmatDock";
import { ServerSync } from "./ServerSync";

/** Landing runs at excited-level energy so the channel and orb feel alive. */
const LANDING_ENERGY = 0.85;

function welcomeDesignToken(design: DesignId): DesignId {
  return design.startsWith("hmat") ? design : "hmat-metal";
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const expression = useMoodExpression();
  const design = useDesignStore((s) => s.design);
  const designHydrated = useDesignHydrated();
  const family = DESIGNS[design].family;

  const isWelcome = pathname.startsWith(ROUTES.welcome);

  // Pre-app surfaces: no tab bar. On `/welcome` the visitor isn't signed in at
  // all, so nav would only offer links that bounce straight back to sign-in.
  const hideNav =
    pathname.startsWith(ROUTES.onboarding) ||
    pathname.startsWith(ROUTES.signin) ||
    isWelcome;

  // The app-wide mood expression drives the surface tint, the `--accent` custom
  // property, the `--energy` scalar, and `--bg` (the mood background as a var,
  // which the Hmat material system tints off). ~400ms so swaps read as one
  // coherent change; reduced-motion neutralises it via globals.css.
  const rootStyle = {
    backgroundColor: isWelcome ? "#E9E4DD" : expression.background,
    ["--accent" as string]: expression.accent,
    ["--energy" as string]: isWelcome ? LANDING_ENERGY : expression.energy,
    ["--bg" as string]: expression.background,
  };

  // Welcome is always the Hmat marketing surface — even when the saved design is
  // Classic. App pages keep their design family unchanged.
  const useHmatShell = isWelcome || (family === "hmat" && designHydrated);

  if (useHmatShell) {
    const welcomeToken = welcomeDesignToken(design);
    const stageMax = isWelcome ? "max-w-landing" : "max-w-app";
    const welcomeBottomPad = isWelcome
      ? "calc(88px + env(safe-area-inset-bottom))"
      : "calc(28px + env(safe-area-inset-bottom))";

    return (
      <div
        className="min-h-dvh transition-colors duration-[400ms] ease-out"
        style={rootStyle}
        data-mood={expression.mood}
      >
        <div className={`relative mx-auto flex min-h-dvh ${stageMax} flex-col`}>
          <div
            className="mat-bg"
            aria-hidden
            {...(isWelcome ? { "data-design": welcomeToken } : {})}
          />
          <div
            className="relative z-10 flex flex-1 flex-col px-5"
            {...(isWelcome ? { "data-design": welcomeToken } : {})}
            style={{
              paddingTop: "max(20px, env(safe-area-inset-top))",
              paddingBottom: hideNav ? welcomeBottomPad : "calc(88px + env(safe-area-inset-bottom))",
            }}
          >
            {children}
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
