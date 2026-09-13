"use client";

import { useReducedMotion } from "motion/react";
import { ReactLenis, useLenis } from "lenis/react";
import { useEffect, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function LenisGsapBridge() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;

    const onScroll = () => {
      ScrollTrigger.update();
    };
    lenis.on("scroll", onScroll);

    const tick = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const refresh = () => {
      ScrollTrigger.refresh();
    };
    refresh();
    window.addEventListener("load", refresh);

    return () => {
      window.removeEventListener("load", refresh);
      gsap.ticker.remove(tick);
      lenis.off("scroll", onScroll);
    };
  }, [lenis]);

  return null;
}

/** Lenis-smoothed scroll for `/welcome` only — not AppShell. */
export function LandingSmoothScroll({ children }: { children: ReactNode }) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <>{children}</>;
  }

  return (
    <ReactLenis
      root
      options={{
        autoRaf: false,
        lerp: 0.085,
        smoothWheel: true,
        syncTouch: false,
      }}
    >
      <LenisGsapBridge />
      {children}
    </ReactLenis>
  );
}
