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

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function lerpPoint(from: Point, to: Point, t: number): Point {
  return {
    x: lerp(from.x, to.x, t),
    y: lerp(from.y, to.y, t),
  };
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
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

        const pairs: Array<{ from: Point; to: Point }> = [];

        const measurePairs = () => {
          pairs.length = 0;
          const heroes = heroEls();
          const chats = chatBubbleEls();
          heroes.forEach((hero, i) => {
            const chat = chats[i];
            if (!chat) return;
            pairs.push({
              from: pointRelativeTo(pin, hero),
              to: pointRelativeTo(pin, chat),
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
            let morphT = t;
            if (raw < 0.08) morphT = 0;
            if (raw > 0.9) morphT = 1;
            const point = lerpPoint(pair.from, pair.to, morphT);
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
            scrub: 1,
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
