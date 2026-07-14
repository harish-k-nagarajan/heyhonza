"use client";

import { usePathname } from "next/navigation";

import { ROUTES } from "@/lib/constants";

import { BottomNav } from "./BottomNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideNav =
    pathname.startsWith(ROUTES.onboarding) || pathname.startsWith(ROUTES.signin);

  return (
    <div className="min-h-dvh bg-[#F5F2EE]">
      <div
        className={`mx-auto min-h-dvh max-w-app bg-[#F5F2EE] px-4 ${hideNav ? "pb-10 pt-10" : "pb-28 pt-6"}`}
        style={{ paddingTop: "max(24px, env(safe-area-inset-top))" }}
      >
        {children}
      </div>
      {!hideNav ? <BottomNav /> : null}
    </div>
  );
}
