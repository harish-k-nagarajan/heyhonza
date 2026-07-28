"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/cn";

const TAB_ROUTES = [ROUTES.chat, ROUTES.call, ROUTES.settings] as const;

function tabIndex(pathname: string) {
  const idx = TAB_ROUTES.findIndex(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
  return idx >= 0 ? idx : 0;
}

type TabScreenTransitionProps = {
  children: React.ReactNode;
  className?: string;
};

/**
 * Direction-aware enter animation for the main tab surfaces (Chat · Call ·
 * Settings). Slower and softer than a hard route swap so tab changes feel
 * continuous rather than jumpy.
 */
export function TabScreenTransition({ children, className }: TabScreenTransitionProps) {
  const pathname = usePathname();
  const prevPathRef = useRef(pathname);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const prev = prevPathRef.current;
    if (prev !== pathname) {
      const delta = tabIndex(pathname) - tabIndex(prev);
      setDirection(delta === 0 ? 0 : delta > 0 ? 1 : -1);
      prevPathRef.current = pathname;
    }
  }, [pathname]);

  const slideClass =
    direction > 0
      ? "motion-safe:animate-tab-enter-from-right motion-reduce:animate-none"
      : direction < 0
        ? "motion-safe:animate-tab-enter-from-left motion-reduce:animate-none"
        : "motion-safe:animate-tab-enter motion-reduce:animate-none";

  return (
    <div key={pathname} className={cn(slideClass, className)}>
      {children}
    </div>
  );
}
