"use client";

import { useEffect, useState } from "react";

/**
 * Whether rich motion is allowed. Mirrors globals.css reduced-motion handling
 * so components can skip JS-driven animation when the user prefers static UI.
 */
export function useMotionGate(): { motionAllowed: boolean } {
  const [motionAllowed, setMotionAllowed] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setMotionAllowed(!mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return { motionAllowed };
}
