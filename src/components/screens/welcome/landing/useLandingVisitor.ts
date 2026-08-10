"use client";

import { useEffect, useState } from "react";

export type LandingVisitor = {
  ready: boolean;
  isReturn: boolean;
  isSignedOut: boolean;
  returnIndex: number;
};

const INITIAL: LandingVisitor = {
  ready: false,
  isReturn: false,
  isSignedOut: false,
  returnIndex: 0,
};

function readLandingVisitor(): LandingVisitor {
  try {
    const params = new URLSearchParams(window.location.search);
    const signedOut = params.get("signedOut") === "1";
    if (signedOut) {
      const clean = new URL(window.location.href);
      clean.searchParams.delete("signedOut");
      window.history.replaceState(null, "", clean.pathname + clean.search + clean.hash);
    }

    return {
      ready: true,
      isReturn: false,
      isSignedOut: signedOut,
      returnIndex: 0,
    };
  } catch {
    return { ready: true, isReturn: false, isSignedOut: false, returnIndex: 0 };
  }
}

/** Tracks post-sign-out state for CTA labels on the marketing homepage. */
export function useLandingVisitor(): LandingVisitor {
  const [state, setState] = useState<LandingVisitor>(INITIAL);

  useEffect(() => {
    const id = window.requestAnimationFrame(() => {
      setState(readLandingVisitor());
    });
    return () => window.cancelAnimationFrame(id);
  }, []);

  return state;
}
