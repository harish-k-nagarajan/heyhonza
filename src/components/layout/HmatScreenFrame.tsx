"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, type AnimationEvent, type ReactNode } from "react";

import { cn } from "@/lib/cn";

/**
 * Soft enter for Chat / Call / Settings on dock tab change.
 * CSS-only — View Transitions around tab pushes hung App Router navigations.
 */
export function HmatScreenFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [motionOk, setMotionOk] = useState(false);

  useEffect(() => {
    setMotionOk(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  // Failsafe if animationend never fires (tab switch mid-animation, etc.).
  useEffect(() => {
    if (!motionOk) return;
    const id = window.setTimeout(() => {
      document
        .querySelector(".hmat-screen-frame--enter")
        ?.classList.remove("hmat-screen-frame--enter");
    }, 500);
    return () => window.clearTimeout(id);
  }, [pathname, motionOk]);

  const onAnimationEnd = (e: AnimationEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    if (e.animationName !== "hmat-screen-enter") return;
    e.currentTarget.classList.remove("hmat-screen-frame--enter");
  };

  return (
    <div
      key={pathname}
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
