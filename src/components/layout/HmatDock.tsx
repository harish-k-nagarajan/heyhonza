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

function indexFromX(x: number, metrics: TabMetrics[]): number {
  if (metrics.length === 0) return 0;
  for (let i = 0; i < metrics.length; i += 1) {
    const tab = metrics[i];
    if (x < tab.left + tab.width) return i;
  }
  return metrics.length - 1;
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
  const tabRefs = useRef<(HTMLAnchorElement | null)[]>([]);
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
    pillWidth: 0,
    minLeft: 0,
    maxLeft: 0,
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
    const navLeft = nav.getBoundingClientRect().left;
    return tabRefs.current.map((tab) => {
      if (!tab) return { left: 0, width: 0 };
      const rect = tab.getBoundingClientRect();
      return { left: rect.left - navLeft, width: rect.width };
    });
  }, []);

  const snapPillToIndex = useCallback(
    (index: number, metrics?: TabMetrics[]) => {
      const tabs = metrics ?? measureTabs();
      const tab = tabs[index >= 0 ? index : 0] ?? tabs[0];
      if (!tab) return;
      setPill({ left: tab.left, width: tab.width });
    },
    [measureTabs],
  );

  useLayoutEffect(() => {
    if (dragRef.current.active) return;
    const index = pendingIndex >= 0 ? pendingIndex : activeIndex >= 0 ? activeIndex : 0;
    snapPillToIndex(index);
    const onResize = () => snapPillToIndex(index);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [activeIndex, pendingIndex, pathname, snapPillToIndex]);

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
      const first = metrics[0];
      const last = metrics[metrics.length - 1];
      const navLeft = navRef.current?.getBoundingClientRect().left ?? 0;
      const startIndex = indexFromX(e.clientX - navLeft, metrics);
      pointerIdRef.current = e.pointerId;
      dragRef.current = {
        active: true,
        moved: false,
        startX: e.clientX,
        pointerId: e.pointerId,
        metrics,
        hoverIndex: startIndex,
        pillWidth: metrics[startIndex]?.width ?? first.width,
        minLeft: first.left,
        maxLeft: last.left,
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

    const navLeft = navRef.current?.getBoundingClientRect().left ?? 0;
    const x = e.clientX - navLeft;
    const nextIndex = indexFromX(x, drag.metrics);
    const pillLeft = rubberClamp(x - drag.pillWidth / 2, drag.minLeft, drag.maxLeft);
    setPill({ left: pillLeft, width: drag.pillWidth });

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
        className="fdock pointer-events-auto relative flex gap-1 rounded-[28px] p-2"
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
            <Link
              key={tab.href}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              href={tab.href}
              aria-current={current ? "page" : undefined}
              onClick={(e) => onTabClick(e, tab.href)}
              className={cn(
                "hmat-tab relative z-[1] flex min-h-11 flex-1 flex-row items-center justify-center gap-2 rounded-[22px] px-[18px] py-3 font-display",
                highlighted && "on",
              )}
            >
              <FernDockIcon name={tab.icon} size={16} />
              <span className="hmat-tab-lbl">{t.nav[tab.labelKey]}</span>
            </Link>
          );
        })}
      </nav>
    </div>
    </>
  );
}
