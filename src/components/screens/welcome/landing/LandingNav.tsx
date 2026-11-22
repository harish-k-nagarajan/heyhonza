"use client";

import Link from "next/link";

import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/cn";
import { TYPE } from "@/lib/design/typography";
import { useLocale } from "@/lib/i18n/useLocale";
import { isShowcaseMode } from "@/lib/site-mode";

import { GithubCta } from "./GithubCta";

export function LandingNav({ githubStars = null }: { githubStars?: number | null }) {
  const { t } = useLocale();
  const showcase = isShowcaseMode();

  return (
    <nav className="landing-nav sticky top-4 z-50 px-5 py-5 md:px-6">
      <div className="landing-nav-pill flex w-full items-center justify-between gap-2 rounded-full border border-[#E8E2DC]/40 bg-white/85 px-4 py-2.5 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset] backdrop-blur-xl sm:px-7 sm:py-3">
        <Link
          href={ROUTES.welcome}
          className="shrink-0 font-display text-[22px] font-bold tracking-[0.04em] text-accent"
        >
          Honza
        </Link>
        <div className="flex min-w-0 items-center gap-4 sm:gap-5">
          <LanguageSwitcher variant="nav" />
          {showcase ? (
            <GithubCta stars={githubStars} variant="nav" />
          ) : (
            <Link
              href={ROUTES.login}
              className={cn(
                "auth-cta-secondary inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full px-3 py-2 sm:px-[18px]",
                TYPE.bodySm,
                "font-semibold",
              )}
            >
              {t.welcome.logIn}
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
