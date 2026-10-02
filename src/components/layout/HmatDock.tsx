"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent,
} from "react";

import { ChatSessionLeaveDialog } from "@/components/chat/ChatSessionLeaveDialog";
import { FernDockIcon, type FernDockIconName } from "@/components/icons/FernDockIcons";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/cn";
import { tapLight } from "@/lib/interaction/haptic";
import { useLocale } from "@/lib/i18n/useLocale";
import { isHmatMainTab } from "@/lib/hmat-tabs";
import {
  endChatSessionAction,
  isTypedChatActive,
} from "@/lib/client/chat-actions";
import { useTabNavStore } from "@/stores/useTabNavStore";

/**
 * O4 frost dock — Chat · Hovor · Nastavení. Horizontal icon+label tabs on frosted
 * glass; active tab slides a charcoal tint (#4A433C18) pill behind the selection.
 * Uses plain router.push (no View Transitions) so tab changes cannot hang.
 *
 * The pill can be scrubbed with a finger as well as tapped: drag tracks 1:1,
 * a haptic fires as the selection crosses a tab, and the route commits on release.
 */
const TABS: { href: string; icon: FernDockIconName; labelKey: "chat" | "call" | "settings" }[] = [
  { href: ROUTES.chat, icon: "chat", labelKey: "chat" },
  { href: ROUTES.call, icon: "call", labelKey: "call" },
  { href: ROUTES.settings, icon: "settings", labelKey: "settings" },
];

const DRAG_THRESHOLD_PX = 8;
const RUBBER = 0.32;

type TabMetrics = { left: number; width: number };

/** Absolute pill uses the nav padding box; tab rects must use the same origin. */
function navContentOriginX(nav: HTMLElement): number {
  const rect = nav.getBoundingClientRect();
  const padLeft = parseFloat(getComputedStyle(nav).paddingLeft) || 0;
  return rect.left + padLeft;
}

function indexFromX(x: number, metrics: TabMetrics[]): number {
  if (metrics.length === 0) return 0;
  let best = 0;
  let bestDist = Infinity;
  for (let i = 0; i < metrics.length; i += 1) {
    const center = metrics[i].left + metrics[i].width / 2;
    const dist = Math.abs(x - center);
    if (dist < bestDist) {
      bestDist = dist;
      best = i;
    }
  }
  return best;
}

/** Pill tracks the finger and eases its width between neighboring tabs. */
function pillFromCenter(
  center: number,
  metrics: TabMetrics[],
): { left: number; width: number } {
  const first = metrics[0];
  const last = metrics[metrics.length - 1];
  if (!first || !last) return { left: 0, width: 0 };

  const centers = metrics.map((tab) => tab.left + tab.width / 2);
  if (center <= centers[0]) {
    return { left: center - first.width / 2, width: first.width };
  }
  const end = centers.length - 1;
  if (center >= centers[end]) {
    return { left: center - last.width / 2, width: last.width };
  }

  let i = 0;
  while (i < end - 1 && center > centers[i + 1]) i += 1;
  const next = i + 1;
  const span = centers[next] - centers[i];
  const t = span === 0 ? 0 : (center - centers[i]) / span;
  const width = metrics[i].width + (metrics[next].width - metrics[i].width) * t;
  return { left: center - width / 2, width };
}

function rubberClamp(value: number, min: number, max: number): number {
  if (value < min) return min + (value - min) * RUBBER;
  if (value > max) return max + (value - max) * RUBBER;
  return value;
}

export function HmatDock() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLocale();
  const setPendingHref = useTabNavStore((s) => s.setPendingHref);
  const pendingHref = useTabNavStore((s) => s.pendingHref);
  const navRef = useRef<HTMLElement>(null);
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [pill, setPill] = useState({ left: 0, width: 0 });
  const [dragging, setDragging] = useState(false);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [leaveTarget, setLeaveTarget] = useState<string | null>(null);

  const suppressClickUntilRef = useRef(0);
  const pointerIdRef = useRef<number | null>(null);
  const dragRef = useRef({
    active: false,
    moved: false,
    startX: 0,
    pointerId: -1,
    metrics: [] as TabMetrics[],
    hoverIndex: 0,
  });

  const activeIndex = TABS.findIndex(
    (tab) => pathname === tab.href || pathname.startsWith(`${tab.href}/`),
  );
  const pendingIndex = pendingHref
    ? TABS.findIndex((tab) => tab.href === pendingHref)
    : -1;
  const highlightIndex =
    previewIndex ??
    (pendingIndex >= 0 ? pendingIndex : activeIndex >= 0 ? activeIndex : 0);

  const measureTabs = useCallback((): TabMetrics[] => {
    const nav = navRef.current;
    if (!nav) return [];
    const originX = navContentOriginX(nav);
    return slotRefs.current.map((slot) => {
      if (!slot) return { left: 0, width: 0 };
      const rect = slot.getBoundingClientRect();
      return { left: rect.left - originX, width: rect.width };
    });
  }, []);

  const snapPillToIndex = useCallback(
    (index: number, metrics?: TabMetrics[]) => {
      const tabs = metrics ?? measureTabs();
      const tab = tabs[index >= 0 ? index : 0] ?? tabs[0];
      if (!tab) return;
      setPill((current) =>
        current.left === tab.left && current.width === tab.width
          ? current
          : { left: tab.left, width: tab.width },
      );
    },
    [measureTabs],
  );

  useLayoutEffect(() => {
    if (dragRef.current.active || dragging) return;
    const index = pendingIndex >= 0 ? pendingIndex : activeIndex >= 0 ? activeIndex : 0;
    snapPillToIndex(index);
    const onResize = () => snapPillToIndex(index);
    window.addEventListener("resize", onResize);
    const observer = new ResizeObserver(onResize);
    const nav = navRef.current;
    if (nav) observer.observe(nav);
    for (const slot of slotRefs.current) {
      if (slot) observer.observe(slot);
    }
    return () => {
      window.removeEventListener("resize", onResize);
      observer.disconnect();
    };
  }, [activeIndex, dragging, pendingIndex, pathname, snapPillToIndex]);

  const commitHref = useCallback(
    (href: string, haptic: boolean) => {
      const index = TABS.findIndex((tab) => tab.href === href);
      if (pathname === href || pathname.startsWith(`${href}/`)) {
        if (index >= 0) snapPillToIndex(index);
        return;
      }
      if (haptic) tapLight();
      if (isHmatMainTab(href)) setPendingHref(href);
      if (index >= 0) snapPillToIndex(index);
      router.push(href);
    },
    [pathname, router, setPendingHref, snapPillToIndex],
  );

  const goToHref = useCallback(
    (href: string, haptic: boolean) => {
      const onChat =
        pathname === ROUTES.chat || pathname.startsWith(`${ROUTES.chat}/`);
      const leavingForMainTab =
        href === ROUTES.call || href === ROUTES.settings;
      if (onChat && leavingForMainTab && isTypedChatActive()) {
        setLeaveTarget(href);
        snapPillToIndex(activeIndex >= 0 ? activeIndex : 0);
        return;
      }
      commitHref(href, haptic);
    },
    [activeIndex, commitHref, pathname, snapPillToIndex],
  );

  useEffect(() => {
    for (const tab of TABS) router.prefetch(tab.href);
  }, [router]);

  const onPointerDown = useCallback(
    (e: PointerEvent<HTMLElement>) => {
      if (e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (pointerIdRef.current !== null) {
        dragRef.current.active = false;
        pointerIdRef.current = null;
      }
      const metrics = measureTabs();
      if (metrics.length === 0) return;
      const originX = navRef.current ? navContentOriginX(navRef.current) : 0;
      const startIndex = indexFromX(e.clientX - originX, metrics);
      pointerIdRef.current = e.pointerId;
      dragRef.current = {
        active: true,
        moved: false,
        startX: e.clientX,
        pointerId: e.pointerId,
        metrics,
        hoverIndex: startIndex,
      };
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        /* Synthetic events and some WebViews cannot capture. */
      }
    },
    [measureTabs],
  );

  const onPointerMove = useCallback((e: PointerEvent<HTMLElement>) => {
    const drag = dragRef.current;
    if (!drag.active || e.pointerId !== drag.pointerId) return;

    if (!drag.moved && Math.abs(e.clientX - drag.startX) < DRAG_THRESHOLD_PX) {
      return;
    }

    if (!drag.moved) {
      drag.moved = true;
      setDragging(true);
      setPreviewIndex(drag.hoverIndex);
    }

    const originX = navRef.current ? navContentOriginX(navRef.current) : 0;
    const x = e.clientX - originX;
    const first = drag.metrics[0];
    const last = drag.metrics[drag.metrics.length - 1];
    if (!first || !last) return;
    const center = rubberClamp(
      x,
      first.left + first.width / 2,
      last.left + last.width / 2,
    );
    setPill(pillFromCenter(center, drag.metrics));
    const nextIndex = indexFromX(x, drag.metrics);

    if (nextIndex !== drag.hoverIndex) {
      drag.hoverIndex = nextIndex;
      setPreviewIndex(nextIndex);
      tapLight();
      const href = TABS[nextIndex]?.href;
      if (href) router.prefetch(href);
    }
  }, [router]);

  const finishPointer = useCallback(
    (e: PointerEvent<HTMLElement>) => {
      const drag = dragRef.current;
      if (!drag.active || e.pointerId !== drag.pointerId) return;

      try {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          e.currentTarget.releasePointerCapture(e.pointerId);
        }
      } catch {
        /* ignore */
      }

      const cancelled = e.type === "pointercancel";
      const moved = drag.moved;
      const targetIndex = drag.hoverIndex;
      drag.active = false;
      pointerIdRef.current = null;
      setDragging(false);
      setPreviewIndex(null);

      suppressClickUntilRef.current = performance.now() + 400;

      if (cancelled) {
        snapPillToIndex(activeIndex >= 0 ? activeIndex : 0, drag.metrics);
        return;
      }

      const tab = TABS[targetIndex];
      if (tab) goToHref(tab.href, !moved);
      else snapPillToIndex(activeIndex >= 0 ? activeIndex : 0, drag.metrics);
    },
    [activeIndex, goToHref, snapPillToIndex],
  );

  const onTabClick = useCallback(
    (e: MouseEvent<HTMLAnchorElement>, href: string) => {
      if (performance.now() < suppressClickUntilRef.current) {
        e.preventDefault();
        return;
      }
      if (
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey ||
        e.button !== 0
      ) {
        return;
      }
      e.preventDefault();
      goToHref(href, true);
    },
    [goToHref],
  );

  return (
    <>
      {leaveTarget ? (
        <ChatSessionLeaveDialog
          title={t.chat.leaveChatTitle}
          body={t.chat.leaveChatBody}
          continueLabel={t.chat.leaveChatContinue}
          endLabel={t.chat.leaveChatEnd}
          onContinue={() => setLeaveTarget(null)}
          onEnd={() => {
            const href = leaveTarget;
            setLeaveTarget(null);
            void endChatSessionAction().then(() => commitHref(href, true));
          }}
        />
      ) : null}
    <div
      className="pointer-events-none fixed inset-x-0 z-40 mx-auto max-w-app px-4"
      style={{ bottom: "max(14px, env(safe-area-inset-bottom))" }}
    >
      <nav
        ref={navRef}
        className="fdock pointer-events-auto relative rounded-[28px] p-2"
        data-dragging={dragging ? "true" : "false"}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={finishPointer}
        onPointerCancel={finishPointer}
      >
        <span
          className="fdock-pill"
          aria-hidden
          style={{
            width: pill.width,
            transform: `translate3d(${pill.left}px, 0, 0)`,
          }}
        />
        {TABS.map((tab, i) => {
          const highlighted = i === highlightIndex;
          const current =
            pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          return (
            <div
              key={tab.href}
              ref={(el) => {
                slotRefs.current[i] = el;
              }}
              className="fdock-slot"
            >
              <Link
                href={tab.href}
                aria-current={current ? "page" : undefined}
                onClick={(e) => onTabClick(e, tab.href)}
                className={cn(
                  "hmat-tab relative z-[1] min-h-11 font-display",
                  highlighted && "on",
                )}
              >
                <FernDockIcon name={tab.icon} size={16} className="shrink-0" />
                <span className="hmat-tab-lbl">{t.nav[tab.labelKey]}</span>
              </Link>
            </div>
          );
        })}
      </nav>
    </div>
    </>
  );
}
