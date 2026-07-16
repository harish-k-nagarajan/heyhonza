"use client";

import { usePathname } from "next/navigation";

import { useMoodExpression } from "@/hooks/useMoodExpression";
import { ROUTES } from "@/lib/constants";

import { BottomNav } from "./BottomNav";
import { MoodCycler } from "./MoodCycler";
import { ServerSync } from "./ServerSync";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const expression = useMoodExpression();

  // Pre-app surfaces: no tab bar. On `/welcome` the visitor isn't signed in at
  // all, so nav would only offer links that bounce straight back to sign-in.
  const hideNav =
    pathname.startsWith(ROUTES.onboarding) ||
    pathname.startsWith(ROUTES.signin) ||
    pathname.startsWith(ROUTES.welcome);

  return (
    // The app-wide mood expression (DESIGN.md: "Background tints are applied
    // app-wide when Honza's state changes"). The surface tint, the `--accent`
    // custom property, and the `--energy` scalar all shift with mood via the one
    // expression engine — accent-colored borders/buttons/links (Tailwind
    // `accent` = var(--accent)) recolor, and any surface reading `--energy`
    // (the Hmat lit channel, orb backlight) brightens/calms with it, which is
    // what makes idle vs excited perceptible without re-hueing. ~400ms so swaps
    // read as one coherent change; reduced-motion neutralises it via globals.css.
    <div
      className="min-h-dvh transition-colors duration-[400ms] ease-out"
      style={{
        backgroundColor: expression.background,
        ["--accent" as string]: expression.accent,
        ["--energy" as string]: expression.energy,
      }}
      data-mood={expression.mood}
    >
      <div
        className={`mx-auto min-h-dvh max-w-app px-4 ${hideNav ? "pb-10 pt-10" : "pb-28 pt-6"}`}
        style={{ paddingTop: "max(24px, env(safe-area-inset-top))" }}
      >
        {children}
      </div>
      {!hideNav ? <BottomNav /> : null}
      <MoodCycler />
      <ServerSync />
    </div>
  );
}
