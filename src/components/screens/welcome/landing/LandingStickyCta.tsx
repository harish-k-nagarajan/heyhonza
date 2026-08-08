"use client";

import Link from "next/link";

import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/cn";
import { useLocale } from "@/lib/i18n/useLocale";

import type { LandingVisitor } from "./useLandingVisitor";

export function LandingStickyCta({ visitor }: { visitor: LandingVisitor }) {
  const { t } = useLocale();
  const w = t.welcome;
  const ctaLabel = visitor.isSignedOut ? w.signedOutCta : w.stickyCta;

  return (
    <div className="landing-sticky-cta md:hidden">
      <Link
        href={ROUTES.signup}
        className={cn(
          "auth-cta-primary mx-auto flex w-full max-w-app items-center justify-center rounded-full py-3.5",
          "font-sans text-[15px] font-semibold",
        )}
      >
        {ctaLabel}
      </Link>
    </div>
  );
}
