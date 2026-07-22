"use client";

import { useDesignHydrated } from "@/hooks/useDesignHydrated";
import { DESIGNS } from "@/lib/design/registry";
import { useDesignStore } from "@/stores/useDesignStore";

import { ClassicWelcome } from "./ClassicWelcome";
import { HmatLanding } from "./landing/HmatLanding";

/**
 * Welcome — design-family aware. Classic renders the original front door;
 * Hmat renders the marketing landing. Both follow the Design Lab choice saved in
 * `honza-design`, so the public funnel matches sign-in and the signed-in app.
 */
export function WelcomeScreen() {
  const design = useDesignStore((s) => s.design);
  const hydrated = useDesignHydrated();
  const family = DESIGNS[design].family;

  if (!hydrated) {
    return (
      <div className="flex min-h-[50dvh] items-center justify-center font-sans text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (family === "hmat") return <HmatLanding />;
  return <ClassicWelcome />;
}
