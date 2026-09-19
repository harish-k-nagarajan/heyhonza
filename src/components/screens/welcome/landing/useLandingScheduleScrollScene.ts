"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { type RefObject } from "react";

gsap.registerPlugin(ScrollTrigger);

const LAYER_SCROLL_END = 0.62;
const NOTIFY_IN_AT = 0.66;
const NOTIFY_OUT_BELOW = 0.5;

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/** Ease in-out so the arc spends more time in the open “sweep” segment. */
function layerT(scrollProgress: number) {
  const raw = Math.min(1, scrollProgress / LAYER_SCROLL_END);
  return raw < 0.5 ? 2 * raw * raw : 1 - Math.pow(-2 * raw + 2, 2) / 2;
}

/**
 * Arc swings out to the left mid-scroll, then returns to the same overlap slot at rest.
 * (Bezier from 0→0 with an exterior control point = half-orbit without separating layout.)
 */
function settingsArcOffset(t: number, wide: boolean) {
  const p0 = { x: 0, y: 0 };
  const p2 = { x: 0, y: 0 };
  const p1 = wide ? { x: -88, y: -40 } : { x: -60, y: -28 };
  const mt = t;
  const omt = 1 - mt;
  return {
    x: omt * omt * p0.x + 2 * omt * mt * p1.x + mt * mt * p2.x,
    y: omt * omt * p0.y + 2 * omt * mt * p1.y + mt * mt * p2.y,
  };
}

function applyLayerDepth(
  t: number,
  settings: HTMLElement | null,
  phone: HTMLElement | null,
  wide: boolean,
) {
  const arc = settingsArcOffset(t, wide);
  const depth = smoothstep(0.22, 0.88, t);
  const fade = smoothstep(0.28, 0.72, t);
  const scale = 1 - depth * 0.045;
  const blurPx = fade * 3.2;
  const opacity = 1 - fade * 0.28;

  if (settings) {
    settings.style.zIndex = "30";
    settings.style.transform = [
      `translate3d(${arc.x}px, ${arc.y}px, ${-140 * depth}px)`,
      `rotateY(${10 * depth}deg)`,
      `scale(${scale})`,
    ].join(" ");
    settings.style.opacity = String(opacity);
    settings.style.filter = blurPx > 0.08 ? `blur(${blurPx}px)` : "none";
  }

  if (phone) {
    const phoneScale = 0.955 + depth * 0.045;
    phone.style.zIndex = "20";
    phone.style.transform = [
      `translate3d(0, 0, ${48 * depth}px)`,
      `scale(${phoneScale})`,
    ].join(" ");
  }
}

function resetLayers(settings: HTMLElement | null, phone: HTMLElement | null) {
  if (settings) {
    settings.style.zIndex = "";
    settings.style.transform = "";
    settings.style.opacity = "";
    settings.style.filter = "";
  }
  if (phone) {
    phone.style.zIndex = "";
    phone.style.transform = "";
  }
}

function setNotifyResting(notify: HTMLElement | null, visible: boolean) {
  if (!notify) return;
  gsap.killTweensOf(notify);
  gsap.set(notify, {
    y: visible ? 0 : 22,
    opacity: visible ? 1 : 0,
    scale: visible ? 1 : 0.97,
    filter: visible ? "blur(0px)" : "blur(2px)",
    force3D: true,
  });
  notify.classList.toggle("is-open", visible);
}

function playNotifyIn(notify: HTMLElement) {
  gsap.killTweensOf(notify);
  notify.classList.add("is-open");
  gsap.fromTo(
    notify,
    {
      y: 28,
      opacity: 0,
      scale: 0.96,
      filter: "blur(3px)",
    },
    {
      y: 0,
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",
      duration: 0.92,
      ease: "power3.out",
      overwrite: "auto",
    },
  );
}

function playNotifyOut(notify: HTMLElement) {
  gsap.killTweensOf(notify);
  notify.classList.remove("is-open");
  gsap.to(notify, {
    y: 22,
    opacity: 0,
    scale: 0.97,
    filter: "blur(2px)",
    duration: 0.35,
    ease: "power2.in",
    overwrite: "auto",
  });
}

function createPinnedScene(
  section: HTMLElement,
  settings: HTMLElement | null,
  phone: HTMLElement | null,
  notify: HTMLElement | null,
  pinEnd: string,
  wide: boolean,
) {
  let notifyShown = false;

  if (notify) {
    notify.classList.add("landing-schedule-notify-driven");
    setNotifyResting(notify, false);
  }

  applyLayerDepth(0, settings, phone, wide);

  const st = ScrollTrigger.create({
    trigger: section,
    start: "top 18%",
    end: pinEnd,
    pin: section,
    pinSpacing: true,
    scrub: 0.65,
    anticipatePin: 1,
    invalidateOnRefresh: true,
    onUpdate(self) {
      const p = self.progress;
      applyLayerDepth(layerT(p), settings, phone, wide);

      if (!notify) return;

      if (p >= NOTIFY_IN_AT && !notifyShown) {
        notifyShown = true;
        playNotifyIn(notify);
      } else if (p < NOTIFY_OUT_BELOW && notifyShown) {
        notifyShown = false;
        playNotifyOut(notify);
      }
    },
  });

  return () => {
    st.kill();
    notifyShown = false;
    resetLayers(settings, phone);
    if (notify) {
      notify.classList.remove("landing-schedule-notify-driven");
      setNotifyResting(notify, false);
    }
  };
}

export function useLandingScheduleScrollScene(
  sectionRef: RefObject<HTMLElement | null>,
  enabled: boolean,
) {
  useGSAP(
    () => {
      if (!sectionRef.current) return;

      const section = sectionRef.current;
      const settings = section.querySelector<HTMLElement>(
        "[data-landing-schedule-settings]",
      );
      const phone = section.querySelector<HTMLElement>("[data-landing-schedule-phone]");
      const notify = section.querySelector<HTMLElement>(".t-toast");

      const mm = gsap.matchMedia();

      const runFinal = () => {
        applyLayerDepth(1, settings, phone, true);
        if (notify) {
          notify.classList.remove("landing-schedule-notify-driven");
          setNotifyResting(notify, true);
        }
      };

      mm.add("(min-width: 768px)", () => {
        if (!enabled) {
          runFinal();
          return () => resetLayers(settings, phone);
        }
        return createPinnedScene(section, settings, phone, notify, "+=145%", true);
      });

      // Stacked layout is taller than the phone viewport — do not pin.
      mm.add("(max-width: 767px)", () => {
        resetLayers(settings, phone);
        if (notify) {
          notify.classList.remove("landing-schedule-notify-driven");
          setNotifyResting(notify, true);
        }
        return () => {
          resetLayers(settings, phone);
          if (notify) {
            gsap.killTweensOf(notify);
            notify.classList.remove("landing-schedule-notify-driven");
            setNotifyResting(notify, false);
          }
        };
      });

      return () => {
        mm.revert();
      };
    },
    { scope: sectionRef, dependencies: [enabled] },
  );
}
