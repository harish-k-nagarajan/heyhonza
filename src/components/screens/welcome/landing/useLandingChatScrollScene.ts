"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { type RefObject } from "react";

gsap.registerPlugin(ScrollTrigger);

type Point = { x: number; y: number };

function pointRelativeTo(container: HTMLElement, el: HTMLElement): Point {
  const c = container.getBoundingClientRect();
  const r = el.getBoundingClientRect();
  return {
    x: r.left - c.left,
    y: r.top - c.top,
  };
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function quadraticPoint(from: Point, control: Point, to: Point, t: number): Point {
  const omt = 1 - t;
  return {
    x: omt * omt * from.x + 2 * omt * t * control.x + t * t * to.x,
    y: omt * omt * from.y + 2 * omt * t * control.y + t * t * to.y,
  };
}

type MorphPathConfig = {
  /** Delay on global eased progress (0–1) before this bubble moves. */
  staggerStart: number;
  /** How much global progress this bubble uses to complete its path. */
  staggerSpan: number;
  /** Bulge perpendicular to the chord (sign = side of arc). */
  perp: number;
  /** Shift control along the chord. */
  along: number;
};

/** Each demo bubble gets its own arc + timing so the handoff feels scattered, not paired. */
const MORPH_PATHS: MorphPathConfig[] = [
  { staggerStart: 0, staggerSpan: 0.9, perp: 1.2, along: -0.38 },
  { staggerStart: 0.07, staggerSpan: 0.88, perp: -1.35, along: -0.12 },
  { staggerStart: 0.12, staggerSpan: 0.86, perp: 1.05, along: 0.28 },
  { staggerStart: 0.17, staggerSpan: 0.84, perp: -1.1, along: 0.08 },
];

function controlForPath(from: Point, to: Point, cfg: MorphPathConfig): Point {
  const mid = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  const perpX = -dy / len;
  const perpY = dx / len;
  const bow = len * 0.52;
  return {
    x: mid.x + dx * cfg.along + perpX * bow * cfg.perp,
    y: mid.y + dy * cfg.along + perpY * bow * cfg.perp,
  };
}

function bubbleMorphT(globalEased: number, index: number, raw: number): number {
  if (raw > 0.92) return 1;
  if (raw < 0.06) return 0;
  const cfg = MORPH_PATHS[index] ?? MORPH_PATHS[0];
  const local = (globalEased - cfg.staggerStart) / cfg.staggerSpan;
  return easeInOutCubic(Math.min(1, Math.max(0, local)));
}

const MORPH_START = 0.02;
const MORPH_END = 0.98;

export function useLandingChatScrollScene(
  bridgeRef: RefObject<HTMLDivElement | null>,
  enabled: boolean,
) {
  useGSAP(
    () => {
      if (!enabled || !bridgeRef.current) return;

      const bridge = bridgeRef.current;
      const pin = bridge.querySelector<HTMLElement>("[data-landing-pin]");
      const layer = bridge.querySelector<HTMLElement>("[data-landing-morph-layer]");
      if (!pin || !layer) return;

      const mm = gsap.matchMedia();

      mm.add("(min-width: 768px)", () => {
        const heroEls = () =>
          Array.from(
            bridge.querySelectorAll<HTMLElement>("[data-landing-hero-bubble]"),
          );
        const chatBubbleEls = () =>
          Array.from(
            bridge.querySelectorAll<HTMLElement>("[data-landing-chat-bubble]"),
          );
        const slotEls = () =>
          Array.from(
            bridge.querySelectorAll<HTMLElement>("[data-landing-chat-slot]"),
          );
        const ghostEls = () =>
          Array.from(layer.querySelectorAll<HTMLElement>(".landing-morph-ghost"));

        const pairs: Array<{ from: Point; to: Point; control: Point }> = [];

        const measurePairs = () => {
          pairs.length = 0;
          const heroes = heroEls();
          const chats = chatBubbleEls();
          heroes.forEach((hero, i) => {
            const chat = chats[i];
            if (!chat) return;
            const from = pointRelativeTo(pin, hero);
            const to = pointRelativeTo(pin, chat);
            const pathCfg = MORPH_PATHS[i] ?? MORPH_PATHS[0];
            pairs.push({
              from,
              to,
              control: controlForPath(from, to, pathCfg),
            });
          });
        };

        const applyGhostStyle = (ghost: HTMLElement, point: Point, opacity: number) => {
          ghost.style.transform = `translate3d(${point.x}px, ${point.y}px, 0)`;
          ghost.style.width = "";
          ghost.style.height = "";
          ghost.style.opacity = String(opacity);
        };

        const setMorphProgress = (raw: number) => {
          const heroes = heroEls();
          const slots = slotEls();
          const ghosts = ghostEls();

          const t = easeInOutCubic(Math.min(1, Math.max(0, raw)));
          const showMorph = raw > MORPH_START && raw < MORPH_END;
          const showInFlow = raw >= MORPH_END;

          layer.style.pointerEvents = "none";
          layer.style.opacity = showMorph || raw <= MORPH_START ? "1" : "0";

          heroes.forEach((hero) => {
            hero.classList.toggle("landing-float-paused", raw > 0.04);
            hero.style.visibility = raw > MORPH_START ? "hidden" : "visible";
          });

          slots.forEach((slot) => {
            slot.style.visibility = showInFlow ? "visible" : "hidden";
            slot.style.opacity = "";
            slot.style.pointerEvents = showInFlow ? "" : "none";
          });

          ghosts.forEach((ghost, i) => {
            const pair = pairs[i];
            if (!pair || !showMorph) {
              ghost.style.opacity = "0";
              return;
            }
            const morphT = bubbleMorphT(t, i, raw);
            const point = quadraticPoint(pair.from, pair.control, pair.to, morphT);
            applyGhostStyle(ghost, point, 1);
          });
        };

        measurePairs();
        setMorphProgress(0);

        const proxy = { p: 0 };
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: bridge,
            start: "top top",
            end: "bottom bottom",
            pin,
            scrub: 1.15,
            invalidateOnRefresh: true,
            anticipatePin: 1,
            onRefresh: () => {
              measurePairs();
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

        ScrollTrigger.refresh();
        requestAnimationFrame(() => {
          measurePairs();
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
        };
      });

      return () => {
        mm.revert();
      };
    },
    { scope: bridgeRef, dependencies: [enabled] },
  );
}
