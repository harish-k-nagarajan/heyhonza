"use client";

import { useCallback, useLayoutEffect, useRef } from "react";

/**
 * Positions a sliding pill with transform + width (tabs recipe).
 * First paint and resize snap with transition: none so the pill does not
 * fly in from translateX(0).
 */
export function useSlidingPill(activeIndex: number, layoutKey?: string | number) {
  const barRef = useRef<HTMLElement | null>(null);
  const pillRef = useRef<HTMLSpanElement | null>(null);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);
  const measured = useRef(false);

  const moveTo = useCallback((animate: boolean) => {
    const pill = pillRef.current;
    const item = itemRefs.current[Math.max(activeIndex, 0)];
    if (!pill || !item) return;
    const x = item.offsetLeft;
    const width = item.offsetWidth;
    if (!animate) {
      const prev = pill.style.transition;
      pill.style.transition = "none";
      pill.style.transform = `translateX(${x}px)`;
      pill.style.width = `${width}px`;
      void pill.offsetWidth;
      pill.style.transition = prev;
      return;
    }
    pill.style.transform = `translateX(${x}px)`;
    pill.style.width = `${width}px`;
  }, [activeIndex]);

  useLayoutEffect(() => {
    moveTo(measured.current);
    measured.current = true;
  }, [moveTo, layoutKey]);

  useLayoutEffect(() => {
    const onResize = () => moveTo(false);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [moveTo]);

  const setItemRef = useCallback((index: number) => (el: HTMLElement | null) => {
    itemRefs.current[index] = el;
  }, []);

  return { barRef, pillRef, setItemRef, moveTo };
}
