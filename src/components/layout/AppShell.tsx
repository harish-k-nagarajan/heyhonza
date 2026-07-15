"use client";

import { usePathname } from "next/navigation";

import { HONZA_STATE_COLORS } from "@/components/honza/theme";
import { ROUTES } from "@/lib/constants";
import { useMoodStore } from "@/stores/useMoodStore";

import { BottomNav } from "./BottomNav";
import { MoodCycler } from "./MoodCycler";
import { ServerSync } from "./ServerSync";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const mood = useMoodStore((s) => s.mood);
  const palette = HONZA_STATE_COLORS[mood];

  const hideNav =
    pathname.startsWith(ROUTES.onboarding) || pathname.startsWith(ROUTES.signin);

  return (
    // The app-wide mood tint (DESIGN.md: "Background tints are applied app-wide
    // when Honza's state changes"). Both the surface tint and the `--accent`
    // custom property shift with mood, so accent-colored borders/buttons/links
    // (Tailwind `accent` = var(--accent)) recolor to match. ~400ms so swaps read
    // as one coherent mood change, not a flicker; reduced-motion neutralises it
    // via the global rule in globals.css.
    <div
      className="min-h-dvh transition-colors duration-[400ms] ease-out"
      style={{
        backgroundColor: palette.background,
        ["--accent" as string]: palette.accent,
      }}
      data-mood={mood}
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
