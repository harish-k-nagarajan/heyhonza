"use client";

import Link from "next/link";

import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/cn";
import { TYPE } from "@/lib/design/typography";
import { useLocale } from "@/lib/i18n/useLocale";

export function LandingNav() {
  const { t } = useLocale();

  return (
    <nav className="landing-nav sticky top-4 z-50 px-5 py-5 md:px-6">
      <div className="landing-nav-pill flex w-full items-center justify-between rounded-full border border-[#E8E2DC]/40 bg-white/85 px-7 py-3 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset] backdrop-blur-xl">
        <Link
          href={ROUTES.welcome}
          className="font-display text-[22px] font-bold tracking-[0.04em] text-accent"
        >
          Honza
        </Link>
        <Link
          href={ROUTES.login}
          className={cn(
            "auth-cta-secondary inline-flex items-center justify-center rounded-full px-[18px] py-2",
            TYPE.bodySm,
            "font-semibold",
          )}
        >
          {t.welcome.logIn}
        </Link>
      </div>
    </nav>
  );
}
