"use client";

import Link from "next/link";

import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/cn";
import { useLocale } from "@/lib/i18n/useLocale";
import { isShowcaseMode } from "@/lib/site-mode";

import { GithubCta } from "./GithubCta";
import type { LandingVisitor } from "./useLandingVisitor";

export function LandingStickyCta({
  visitor,
  githubStars = null,
}: {
  visitor: LandingVisitor;
  githubStars?: number | null;
}) {
  const { t } = useLocale();
  const w = t.welcome;

  if (isShowcaseMode()) {
    return (
      <div className="landing-sticky-cta md:hidden">
        <GithubCta stars={githubStars} variant="sticky" />
      </div>
    );
  }

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
