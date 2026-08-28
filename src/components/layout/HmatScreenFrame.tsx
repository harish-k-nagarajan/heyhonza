"use client";

import { usePathname } from "next/navigation";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type AnimationEvent,
  type ReactNode,
} from "react";

import { cn } from "@/lib/cn";
import { ROUTES } from "@/lib/constants";
import { readCssMs } from "@/lib/motion/readCssMs";

function subscribeReducedMotion(onStoreChange: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

function getReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function copyScroll(from: Element, to: Element) {
  const fromEls = [from, ...from.querySelectorAll("*")];
  const toEls = [to, ...to.querySelectorAll("*")];
  for (let i = 0; i < fromEls.length && i < toEls.length; i += 1) {
    const src = fromEls[i] as HTMLElement;
    const dst = toEls[i] as HTMLElement;
    if (src.scrollTop) dst.scrollTop = src.scrollTop;
    if (src.scrollLeft) dst.scrollLeft = src.scrollLeft;
  }
}

function snapshotLive(live: HTMLElement): HTMLElement {
  const clone = live.cloneNode(true) as HTMLElement;
  clone.classList.remove("hmat-screen-frame--enter");
  clone.style.animation = "none";
  clone.style.opacity = "1";
  clone.style.transform = "none";
  clone.style.filter = "none";
  copyScroll(live, clone);
  return clone;
}

function nestedSlide(from: string, to: string): "x-fwd" | "x-back" | "y" {
  if (from === ROUTES.settings && to === ROUTES.account) return "x-fwd";
  if (from === ROUTES.account && to === ROUTES.settings) return "x-back";
  return "y";
}

/**
 * Soft enter/exit for Chat / Call / Settings on dock tab change.
 * CSS-only enter + DOM overlay clone for exit — View Transitions hung App Router.
 */
export function HmatScreenFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotion,
    () => false,
  );
  const motionOk = !reducedMotion;
  const liveRef = useRef<HTMLDivElement>(null);
  const exitRef = useRef<HTMLDivElement>(null);
  const snapshotRef = useRef<HTMLElement | null>(null);
  const prevPathRef = useRef(pathname);
  const [route, setRoute] = useState({ path: pathname, slide: "y" as "x-fwd" | "x-back" | "y" });
  if (route.path !== pathname) {
    setRoute({ path: pathname, slide: nestedSlide(route.path, pathname) });
  }

  useLayoutEffect(() => {
    const live = liveRef.current;
    const exitSlot = exitRef.current;
    const prevPath = prevPathRef.current;

    if (prevPath !== pathname && motionOk && snapshotRef.current && exitSlot) {
      exitSlot.replaceChildren(snapshotRef.current);
      exitSlot.dataset.slide = route.slide;
      exitSlot.classList.remove("is-exiting");
      void exitSlot.offsetWidth;
      exitSlot.classList.add("is-exiting");
      const ms = readCssMs("--td-duration-fast", 250);
      window.setTimeout(() => {
        if (exitRef.current === exitSlot) {
          exitSlot.classList.remove("is-exiting");
          exitSlot.replaceChildren();
        }
      }, ms + 20);
    }

    prevPathRef.current = pathname;

    if (live) {
      snapshotRef.current = snapshotLive(live);
    }
  }, [pathname, motionOk, route.slide]);

  useEffect(() => {
    if (!motionOk) return;
    const id = window.setTimeout(() => {
      document
        .querySelector(".hmat-screen-frame--enter")
        ?.classList.remove("hmat-screen-frame--enter");
    }, readCssMs("--td-duration-fast", 250) + 40);
    return () => window.clearTimeout(id);
  }, [pathname, motionOk]);

  const onAnimationEnd = (e: AnimationEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    if (e.animationName !== "hmat-screen-enter" && !e.animationName.startsWith("hmat-screen-enter")) {
      return;
    }
    e.currentTarget.classList.remove("hmat-screen-frame--enter");
  };

  return (
    <div className="hmat-screen-frame flex min-h-0 flex-1 flex-col overflow-hidden">
      <div ref={exitRef} className="hmat-screen-exit-slot" aria-hidden />
      <div
        key={pathname}
        ref={liveRef}
        data-slide={route.slide}
        className={cn(
          "hmat-screen-live",
          motionOk && "hmat-screen-frame--enter",
        )}
        onAnimationEnd={onAnimationEnd}
      >
        {children}
      </div>
    </div>
  );
}
