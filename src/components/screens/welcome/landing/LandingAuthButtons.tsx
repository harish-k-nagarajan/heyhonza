"use client";

import Link from "next/link";

import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/cn";
import { TYPE } from "@/lib/design/typography";
import { useLocale } from "@/lib/i18n/useLocale";

import type { LandingVisitor } from "./useLandingVisitor";

export function LandingAuthButtons({
  visitor,
  size = "md",
  className,
}: {
  visitor?: Pick<LandingVisitor, "isSignedOut">;
  size?: "sm" | "md";
  className?: string;
}) {
  const { t } = useLocale();
  const w = t.welcome;
  const primaryLabel = visitor?.isSignedOut ? w.signedOutCta : w.heroCta;

  const pad = size === "sm" ? "px-5 py-2.5" : "px-7 py-3.5";

  return (
    <div className={cn("flex flex-wrap items-center justify-center gap-5", className)}>
      <Link
        href={ROUTES.signup}
        className={cn(
          "auth-cta-primary inline-flex items-center justify-center rounded-full font-sans text-[15px] font-semibold",
          pad,
        )}
      >
        {primaryLabel}
      </Link>
      <Link
        href={ROUTES.login}
        className={cn(
          "auth-cta-secondary inline-flex items-center justify-center rounded-full font-sans text-[15px] font-semibold",
          pad,
        )}
      >
        {w.logIn}
      </Link>
    </div>
  );
}

export function LandingCtaHint({
  visitor,
  className,
}: {
  visitor?: Pick<LandingVisitor, "isSignedOut">;
  className?: string;
}) {
  const { t } = useLocale();
  const w = t.welcome;
  const hint = visitor?.isSignedOut ? w.signedOutCtaHint : w.heroCtaHint;

  return (
    <p className={cn(TYPE.label, "text-muted-foreground", className)}>
      {hint}
    </p>
  );
}
