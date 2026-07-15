"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/cn";

const items = [
  { href: ROUTES.home, label: "Home" },
  { href: ROUTES.chat, label: "Chat" },
  { href: ROUTES.call, label: "Call" },
  { href: ROUTES.settings, label: "Settings" },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-[#F5F2EE]/95 backdrop-blur-md"
      style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
    >
      <div className="mx-auto flex max-w-app justify-around px-2 pt-2 font-sans">
        {items.map((item) => {
          const active =
            item.href === ROUTES.home
              ? pathname === ROUTES.home
              : pathname.startsWith(item.href);
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
              <span className="text-[9px] uppercase tracking-[0.2em]">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
