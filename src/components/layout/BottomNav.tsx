"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/cn";
import { useLocale } from "@/lib/i18n/useLocale";

const items = [
  { href: ROUTES.chat, labelKey: "chat" as const },
  { href: ROUTES.call, labelKey: "call" as const },
  { href: ROUTES.settings, labelKey: "settings" as const },
];

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useLocale();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-[#F5F2EE]/95 backdrop-blur-md"
      style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
    >
      <div className="mx-auto flex max-w-app justify-around px-2 pt-2 font-sans">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-11 min-w-[72px] flex-1 flex-col items-center justify-center gap-1 transition",
                active ? "text-accent" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span
                className={cn(
                  "h-1 w-1 rounded-full",
                  active ? "bg-accent" : "bg-transparent",
                )}
                aria-hidden
              />
              <span className="text-[9px] uppercase tracking-[0.2em]">
                {t.nav[item.labelKey]}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
