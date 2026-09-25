"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { CallScreen } from "@/components/screens/call/CallScreen";
import { ChatScreen } from "@/components/screens/chat/ChatScreen";
import { SettingsScreen } from "@/components/screens/settings/SettingsScreen";
import { ROUTES } from "@/lib/constants";
import { displayTabHref } from "@/lib/hmat-tabs";
import { useTabNavStore } from "@/stores/useTabNavStore";

export function HmatTabStage() {
  const pathname = usePathname();
  const pendingHref = useTabNavStore((s) => s.pendingHref);
  const setPendingHref = useTabNavStore((s) => s.setPendingHref);
  const href = displayTabHref(pathname, pendingHref);

  useEffect(() => {
    if (pendingHref && pathname === pendingHref) setPendingHref(null);
  }, [pathname, pendingHref, setPendingHref]);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      {href === ROUTES.call ? (
        <CallScreen />
      ) : href === ROUTES.settings ? (
        <SettingsScreen />
      ) : (
        <ChatScreen />
      )}
    </div>
  );
}
