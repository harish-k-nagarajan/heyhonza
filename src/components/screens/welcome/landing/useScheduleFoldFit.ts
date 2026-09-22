"use client";

import { useEffect, useState, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export type ScheduleCompactLayout = "beside" | "stack";

const DESKTOP = "(min-width: 768px)";
/** Below this, the schedule pills and label wrap into a broken column. */
const READABLE_SETTINGS_W = 268;
const MIN_BESIDE_PHONE = 124;

function stageBudget(section: HTMLElement): number {
  const cta = document.querySelector(".landing-sticky-cta");
  const ctaH = cta instanceof HTMLElement ? cta.getBoundingClientRect().height : 0;
  const header = section.querySelector("header");
  const lead = section.querySelector("[data-landing-schedule-lead]");
  const headerH = header instanceof HTMLElement ? header.getBoundingClientRect().height : 0;
  const leadH = lead instanceof HTMLElement ? lead.getBoundingClientRect().height : 0;
  const cs = getComputedStyle(section);
  const pad = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
  const gap = parseFloat(cs.rowGap || cs.gap || "0") || 0;
  return window.innerHeight - ctaH - headerH - leadH - pad - gap * 2 - 8;
}

function contentWidth(section: HTMLElement): number {
  const cs = getComputedStyle(section);
  return section.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
}

function besidePhoneWidth(contentW: number): number {
  return Math.round(Math.min(156, Math.max(MIN_BESIDE_PHONE, contentW - READABLE_SETTINGS_W - 10)));
}

function stackPhoneWidth(contentW: number): number {
  return Math.round(Math.min(176, Math.max(150, contentW * 0.5)));
}

function clearStageScale(section: HTMLElement): void {
  const stage = section.querySelector("[data-landing-schedule-stage]");
  if (!(stage instanceof HTMLElement)) return;
  stage.style.transform = "";
  stage.style.marginBottom = "";
}

function fitStage(section: HTMLElement): void {
  const stage = section.querySelector("[data-landing-schedule-stage]");
  if (!(stage instanceof HTMLElement)) return;
  const budget = stageBudget(section);
  const height = stage.offsetHeight;
  if (height > budget + 4 && height > 0) {
    const scale = Math.max(0.68, budget / height);
    stage.style.transformOrigin = "top center";
    stage.style.transform = `scale(${scale})`;
    stage.style.marginBottom = `${-Math.round(height * (1 - scale))}px`;
  } else {
    clearStageScale(section);
  }
  ScrollTrigger.refresh();
}

/**
 * On a small screen, keep the schedule card and the phone fully visible.
 * Side by side only when the card can stay wide enough to read; otherwise the
 * phone sits underneath, narrower than the card. If the pair is still too
 * tall, both scale down together.
 */
export function useScheduleFoldFit(
  sectionRef: RefObject<HTMLElement | null>,
): ScheduleCompactLayout {
  const [layout, setLayout] = useState<ScheduleCompactLayout>("stack");

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const measure = () => {
      if (window.matchMedia(DESKTOP).matches) {
        clearStageScale(section);
        section.style.removeProperty("--schedule-phone-w");
        return;
      }

      const settings = section.querySelector("[data-landing-schedule-settings]");
      if (!(settings instanceof HTMLElement)) return;

      const width = contentWidth(section);
      const canSitBeside = width - READABLE_SETTINGS_W - 10 >= MIN_BESIDE_PHONE;
      const next: ScheduleCompactLayout = canSitBeside ? "beside" : "stack";
      const phoneW = canSitBeside ? besidePhoneWidth(width) : stackPhoneWidth(width);

      section.style.setProperty("--schedule-phone-w", `${phoneW}px`);
      if (next !== layout) {
        setLayout(next);
        return;
      }
      requestAnimationFrame(() => fitStage(section));
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [layout, sectionRef]);

  return layout;
}
