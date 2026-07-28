"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { HardwareIcon } from "@/components/icons/HardwareIcons";
import type { IconName } from "@/components/icons/HardwareIcons";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/cn";
import { tapLight } from "@/lib/interaction/haptic";
import { useLocale } from "@/lib/i18n/useLocale";

/**
 * The floating material dock — Chat · Hovor · Nastavení (chat-first, 3 tabs).
 * Active tab uses a sliding accent pill.
 */
const TABS: { href: string; icon: IconName; labelKey: "chat" | "call" | "settings" }[] = [
  { href: ROUTES.chat, icon: "chat", labelKey: "chat" },
  { href: ROUTES.call, icon: "call", labelKey: "call" },
  { href: ROUTES.settings, icon: "settings", labelKey: "settings" },
];

export function HmatDock() {
  const pathname = usePathname();
  const { t } = useLocale();
  const navRef = useRef<HTMLElement>(null);
  const tabRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [pill, setPill] = useState({ left: 0, width: 0 });

  const activeIndex = TABS.findIndex(
    (tab) => pathname === tab.href || pathname.startsWith(`${tab.href}/`),
  );

  const measurePill = useCallback(() => {
    const nav = navRef.current;
    const tab = tabRefs.current[activeIndex >= 0 ? activeIndex : 0];
    if (!nav || !tab) return;
    const navRect = nav.getBoundingClientRect();
    const tabRect = tab.getBoundingClientRect();
    setPill({
      left: tabRect.left - navRect.left,
      width: tabRect.width,
    });
  }, [activeIndex]);

  useEffect(() => {
    measurePill();
    window.addEventListener("resize", measurePill);
    return () => window.removeEventListener("resize", measurePill);
  }, [measurePill, pathname]);

  return (
    <div
      className="pointer-events-none fixed inset-x-0 z-40 mx-auto max-w-app px-4"
      style={{ bottom: "max(14px, env(safe-area-inset-bottom))" }}
    >
      <nav ref={navRef} className="fdock pointer-events-auto relative">
        <span
          className="fdock-pill"
          aria-hidden
          style={{ left: pill.left, width: pill.width }}
        />
        {TABS.map((tab, i) => {
          const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          return (
            <Link
              key={tab.href}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              onClick={() => tapLight()}
              className={cn("hmat-tab relative z-[1]", active && "on")}
            >
              <HardwareIcon name={tab.icon} size={21} />
              <span className="lbl font-display text-[8px] uppercase tracking-[0.1em]">
                {t.nav[tab.labelKey]}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
