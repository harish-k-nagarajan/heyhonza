"use client";

import { useEffect, useState } from "react";

import {
  LANDING_STORAGE_KEY,
  LANDING_VISIT_COUNT_KEY,
} from "@/components/screens/welcome/welcome-content";

export type LandingVisitor = {
  ready: boolean;
  isReturn: boolean;
  isSignedOut: boolean;
  returnIndex: number;
};

/** Tracks first vs return visits and post-sign-out for personality-driven hero copy. */
export function useLandingVisitor(): LandingVisitor {
  const [state, setState] = useState<LandingVisitor>({
    ready: false,
    isReturn: false,
    isSignedOut: false,
    returnIndex: 0,
  });

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const signedOut = params.get("signedOut") === "1";
      if (signedOut) {
        const clean = new URL(window.location.href);
        clean.searchParams.delete("signedOut");
        window.history.replaceState(null, "", clean.pathname + clean.search + clean.hash);
      }

      const seen = localStorage.getItem(LANDING_STORAGE_KEY) === "1";
      const rawCount = localStorage.getItem(LANDING_VISIT_COUNT_KEY);
      const count = rawCount ? Number.parseInt(rawCount, 10) : 0;
      const nextCount = Number.isFinite(count) ? count + 1 : 1;

      localStorage.setItem(LANDING_STORAGE_KEY, "1");
      localStorage.setItem(LANDING_VISIT_COUNT_KEY, String(nextCount));

      setState({
        ready: true,
        isReturn: seen && !signedOut,
        isSignedOut: signedOut,
        returnIndex: seen ? (nextCount - 2) % 3 : 0,
      });
    } catch {
      setState({ ready: true, isReturn: false, isSignedOut: false, returnIndex: 0 });
    }
  }, []);

  return state;
}
