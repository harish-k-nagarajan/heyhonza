"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { HardwareIcon } from "@/components/icons/HardwareIcons";
import type { IconName } from "@/components/icons/HardwareIcons";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/cn";
import { useLocale } from "@/lib/i18n/useLocale";

/**
 * The floating material dock — the Hmat nav. Detached from the bottom edge,
 * rounded, material (not glass). Four destinations with the hardware icon set:
 * Domů · Chat · Hovor (phone, not mic) · Nastavení. The active tab is tinted
 * with the mood accent. Fixed within the centered phone stage; content is padded
 * to clear it so nothing overlaps.
 */
const TABS: { href: string; icon: IconName; labelKey: "chat" | "call" | "settings" }[] = [
  { href: ROUTES.chat, icon: "chat", labelKey: "chat" },
  { href: ROUTES.call, icon: "call", labelKey: "call" },
  { href: ROUTES.settings, icon: "settings", labelKey: "settings" },
];

export function HmatDock() {
  const pathname = usePathname();
  const { t } = useLocale();

  return (
    <div
      className="pointer-events-none fixed inset-x-0 z-40 mx-auto max-w-app px-4"
      style={{ bottom: "max(14px, env(safe-area-inset-bottom))" }}
    >
      <nav className="fdock pointer-events-auto">
        {TABS.map((tab) => {
          const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={cn("hmat-tab", active && "on")}
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
