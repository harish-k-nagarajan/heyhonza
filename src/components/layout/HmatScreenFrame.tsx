"use client";

import { usePathname } from "next/navigation";
import { useEffect, useSyncExternalStore, type AnimationEvent, type ReactNode } from "react";

import { cn } from "@/lib/cn";

function subscribeReducedMotion(onStoreChange: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

function getReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Soft enter for Chat / Call / Settings on dock tab change.
 * CSS-only — View Transitions around tab pushes hung App Router navigations.
 */
export function HmatScreenFrame({
  children,
  frameKey,
}: {
  children: ReactNode;
  /** Optimistic tab href so the enter animation starts on tap, not after RSC. */
  frameKey?: string;
}) {
  const pathname = usePathname();
  const key = frameKey ?? pathname;
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotion,
    () => false,
  );
  const motionOk = !reducedMotion;

  // Failsafe if animationend never fires (tab switch mid-animation, etc.).
  useEffect(() => {
    if (!motionOk) return;
    const id = window.setTimeout(() => {
      document
        .querySelector(".hmat-screen-frame--enter")
        ?.classList.remove("hmat-screen-frame--enter");
    }, 280);
    return () => window.clearTimeout(id);
  }, [key, motionOk]);

  const onAnimationEnd = (e: AnimationEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    if (e.animationName !== "hmat-screen-enter") return;
    e.currentTarget.classList.remove("hmat-screen-frame--enter");
  };

  return (
    <div
      key={key}
      className={cn(
        "hmat-screen-frame flex min-h-0 flex-1 flex-col overflow-hidden",
        motionOk && "hmat-screen-frame--enter",
      )}
      onAnimationEnd={onAnimationEnd}
    >
      {children}
    </div>
  );
}
