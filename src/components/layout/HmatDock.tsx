"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, type MouseEvent } from "react";

import { FernDockIcon } from "@/components/icons/FernDockIcons";
import type { FernDockIconName } from "@/components/icons/FernDockIcons";
import { useSlidingPill } from "@/hooks/useSlidingPill";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/cn";
import { tapLight } from "@/lib/interaction/haptic";
import { useLocale } from "@/lib/i18n/useLocale";

/**
 * O4 frost dock — Chat · Hovor · Nastavení. Horizontal icon+label tabs on frosted
 * glass; active tab slides a charcoal tint (#4A433C18) pill behind the selection.
 * Uses plain router.push (no View Transitions) so tab changes cannot hang.
 */
const TABS: { href: string; icon: FernDockIconName; labelKey: "chat" | "call" | "settings" }[] = [
  { href: ROUTES.chat, icon: "chat", labelKey: "chat" },
  { href: ROUTES.call, icon: "call", labelKey: "call" },
  { href: ROUTES.settings, icon: "settings", labelKey: "settings" },
];

export function HmatDock() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLocale();

  const activeIndex = TABS.findIndex(
    (tab) => pathname === tab.href || pathname.startsWith(`${tab.href}/`),
  );
  const { barRef, pillRef, setItemRef } = useSlidingPill(
    activeIndex >= 0 ? activeIndex : 0,
    `${pathname}:${t.nav.chat}:${t.nav.call}:${t.nav.settings}`,
  );

  const onTabClick = useCallback(
    (e: MouseEvent<HTMLAnchorElement>, href: string) => {
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
      if (pathname === href || pathname.startsWith(`${href}/`)) return;
      tapLight();
      router.push(href);
    },
    [pathname, router],
  );

  return (
    <div
      className="pointer-events-none fixed inset-x-0 z-40 mx-auto max-w-app px-4"
      style={{ bottom: "max(14px, env(safe-area-inset-bottom))" }}
    >
      <nav
        ref={barRef}
        className="fdock pointer-events-auto relative flex gap-1 rounded-[28px] p-2"
      >
        <span ref={pillRef} className="fdock-pill" aria-hidden />
        {TABS.map((tab, i) => {
          const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          return (
            <Link
              key={tab.href}
              ref={setItemRef(i)}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              onClick={(e) => onTabClick(e, tab.href)}
              className={cn(
                "hmat-tab relative z-[1] flex min-h-11 flex-1 flex-row items-center justify-center gap-2 rounded-[22px] px-[18px] py-3 font-display",
                active && "on",
              )}
            >
              <FernDockIcon name={tab.icon} size={16} />
              <span className="hmat-tab-lbl">{t.nav[tab.labelKey]}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
