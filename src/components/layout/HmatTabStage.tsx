"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { CallScreen } from "@/components/screens/call/CallScreen";
import { ChatScreen } from "@/components/screens/chat/ChatScreen";
import { SettingsScreen } from "@/components/screens/settings/SettingsScreen";
import { ROUTES } from "@/lib/constants";
import { displayTabHref } from "@/lib/hmat-tabs";
import { useTabNavStore } from "@/stores/useTabNavStore";

const TAB_PAGES = [
  { id: 1, href: ROUTES.chat, Screen: ChatScreen },
  { id: 2, href: ROUTES.call, Screen: CallScreen },
  { id: 3, href: ROUTES.settings, Screen: SettingsScreen },
] as const;

function tabPageId(href: string): number {
  const tab = TAB_PAGES.find((t) => t.href === href);
  return tab?.id ?? 1;
}

/**
 * Chat / Call / Settings share one stage. All three stay mounted from the
 * first paint so a dock tap swaps to a page that is already laid out.
 */
export function HmatTabStage() {
  const pathname = usePathname();
  const pendingHref = useTabNavStore((s) => s.pendingHref);
  const setPendingHref = useTabNavStore((s) => s.setPendingHref);
  const href = displayTabHref(pathname, pendingHref);
  const activePage = tabPageId(href);

  useEffect(() => {
    if (pendingHref && pathname === pendingHref) setPendingHref(null);
  }, [pathname, pendingHref, setPendingHref]);

  return (
    <div
      className="hmat-tab-slide flex min-h-0 flex-1 flex-col overflow-hidden"
      data-page={String(activePage)}
    >
      {TAB_PAGES.map(({ id, Screen }) => {
        const isActive = id === activePage;
        return (
          <section
            key={id}
            className="hmat-tab-page flex min-h-0 flex-1 flex-col overflow-hidden"
            data-page-id={String(id)}
            aria-hidden={!isActive}
            inert={isActive ? undefined : true}
          >
            <Screen />
          </section>
        );
      })}
    </div>
  );
}
