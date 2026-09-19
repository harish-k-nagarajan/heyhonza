"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { type RefObject } from "react";

gsap.registerPlugin(ScrollTrigger);

type Point = { x: number; y: number };

function pointViewport(el: HTMLElement): Point {
  const r = el.getBoundingClientRect();
  return { x: r.left, y: r.top };
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function cubicPoint(p0: Point, p1: Point, p2: Point, p3: Point, t: number): Point {
  const u = 1 - t;
  const tt = t * t;
  const uu = u * u;
  return {
    x: uu * u * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + tt * t * p3.x,
    y: uu * u * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + tt * t * p3.y,
  };
}

type MorphPathConfig = {
  staggerStart: number;
  staggerSpan: number;
  wanderX: number;
};

/**
 * Mixed departure order (not 0–3). Wander is a small px drift — never a
 * length-scaled sideways orbit around the recess.
 */
const MORPH_PATHS: MorphPathConfig[] = [
  { staggerStart: 0.2, staggerSpan: 0.62, wanderX: 22 },
  { staggerStart: 0.02, staggerSpan: 0.58, wanderX: -18 },
  { staggerStart: 0.36, staggerSpan: 0.56, wanderX: 14 },
  { staggerStart: 0.1, staggerSpan: 0.6, wanderX: -26 },
];

function controlsForPath(from: Point, to: Point, wanderX: number): { c1: Point; c2: Point } {
  const dy = to.y - from.y;
  return {
    c1: {
      x: from.x + wanderX,
      y: from.y + dy * 0.32,
    },
    c2: {
      x: lerp(from.x, to.x, 0.78) + wanderX * 0.2,
      y: from.y + dy * 0.72,
    },
  };
}

function bubbleMorphT(raw: number, index: number): number {
  if (raw >= 0.97) return 1;
  if (raw < 0.015) return 0;
  const cfg = MORPH_PATHS[index] ?? MORPH_PATHS[0];
  const local = (raw - cfg.staggerStart) / cfg.staggerSpan;
  return Math.min(1, Math.max(0, local));
}

const MORPH_END = 0.97;

export function useLandingChatScrollScene(
  bridgeRef: RefObject<HTMLDivElement | null>,
  enabled: boolean,
) {
  useGSAP(
    () => {
      if (!enabled || !bridgeRef.current) return;

      const bridge = bridgeRef.current;
      const pin = bridge.querySelector<HTMLElement>("[data-landing-pin]");
      const layer = document.querySelector<HTMLElement>("[data-landing-morph-layer]");
      if (!pin || !layer) return;

      ScrollTrigger.config({ ignoreMobileResize: true });

      const heroEls = () =>
        Array.from(bridge.querySelectorAll<HTMLElement>("[data-landing-hero-bubble]"));
      const chatBubbleEls = () =>
        Array.from(bridge.querySelectorAll<HTMLElement>("[data-landing-chat-bubble]"));
      const slotEls = () =>
        Array.from(bridge.querySelectorAll<HTMLElement>("[data-landing-chat-slot]"));
      const ghostEls = () =>
        Array.from(layer.querySelectorAll<HTMLElement>(".landing-morph-ghost"));

      const wanderScale = () =>
        Math.min(1, Math.max(0.4, window.innerWidth / 900));

      const applyGhostStyle = (ghost: HTMLElement, point: Point, opacity: number) => {
        ghost.style.transform = `translate3d(${point.x}px, ${point.y}px, 0)`;
        ghost.style.width = "";
        ghost.style.height = "";
        ghost.style.opacity = String(opacity);
      };

      const setMorphProgress = (raw: number) => {
        const heroes = heroEls();
        const chats = chatBubbleEls();
        const slots = slotEls();
        const ghosts = ghostEls();
        const showInFlow = raw >= MORPH_END;
        const scale = wanderScale();

        layer.style.pointerEvents = "none";
        layer.style.opacity = showInFlow ? "0" : "1";

        heroes.forEach((hero, i) => {
          const morphT = bubbleMorphT(raw, i);
          hero.classList.toggle("landing-float-paused", raw > 0.01);
          hero.style.visibility = morphT > 0.001 ? "hidden" : "visible";
        });

        slots.forEach((slot) => {
          slot.style.visibility = showInFlow ? "visible" : "hidden";
          slot.style.opacity = "";
          slot.style.pointerEvents = showInFlow ? "" : "none";
        });

        ghosts.forEach((ghost, i) => {
          const hero = heroes[i];
          const chat = chats[i];
          if (!hero || !chat || showInFlow) {
            ghost.style.opacity = "0";
            return;
          }
          const morphT = bubbleMorphT(raw, i);
          if (morphT <= 0) {
            ghost.style.opacity = "0";
            return;
          }
          const from = pointViewport(hero);
          const to = pointViewport(chat);
          const cfg = MORPH_PATHS[i] ?? MORPH_PATHS[0];
          const { c1, c2 } = controlsForPath(from, to, cfg.wanderX * scale);
          applyGhostStyle(ghost, cubicPoint(from, c1, c2, to, morphT), 1);
        });
      };

      const proxy = { p: 0 };
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: bridge,
          start: "top top",
          end: "bottom bottom",
          pin,
          pinSpacing: true,
          scrub: 1.85,
          invalidateOnRefresh: true,
          anticipatePin: 0,
          onRefresh: () => {
            setMorphProgress(proxy.p);
          },
        },
      });

      tl.to(proxy, {
        p: 1,
        duration: 1,
        ease: "none",
        onUpdate() {
          setMorphProgress(proxy.p);
        },
      });

      setMorphProgress(0);
      ScrollTrigger.refresh();
      requestAnimationFrame(() => {
        setMorphProgress(proxy.p);
      });

      return () => {
        heroEls().forEach((hero) => {
          hero.style.visibility = "";
          hero.classList.remove("landing-float-paused");
        });
        slotEls().forEach((slot) => {
          slot.style.visibility = "";
          slot.style.opacity = "";
          slot.style.pointerEvents = "";
        });
        layer.style.opacity = "";
        ghostEls().forEach((ghost) => {
          ghost.style.opacity = "";
          ghost.style.transform = "";
        });
      };
    },
    { scope: bridgeRef, dependencies: [enabled] },
  );
}
