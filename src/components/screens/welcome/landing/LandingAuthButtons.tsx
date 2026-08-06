import Link from "next/link";

import {
  LANDING_HERO_FIRST,
  LANDING_HERO_SIGNED_OUT,
} from "@/components/screens/welcome/welcome-content";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/cn";
import { TYPE } from "@/lib/design/typography";

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
  const primaryLabel = visitor?.isSignedOut
    ? LANDING_HERO_SIGNED_OUT.cta
    : LANDING_HERO_FIRST.cta;

  const pad = size === "sm" ? "px-5 py-2.5" : "px-7 py-3.5";

  return (
    <div className={cn("flex flex-wrap items-center justify-center gap-5", className)}>
      <Link
        href={ROUTES.signin}
        className={cn(
          "landing-cta-primary inline-flex items-center justify-center rounded-full font-sans text-[15px] font-semibold text-white",
          pad,
        )}
      >
        {primaryLabel}
      </Link>
      <Link
        href={ROUTES.signin}
        className={cn(
          "inline-flex items-center justify-center rounded-full border border-border bg-white font-sans text-[15px] font-semibold text-foreground",
          pad,
        )}
      >
        Log in
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
  const hint = visitor?.isSignedOut
    ? LANDING_HERO_SIGNED_OUT.ctaHint
    : LANDING_HERO_FIRST.ctaHint;

  return (
    <p className={cn(TYPE.label, "text-muted-foreground", className)}>
      {hint}
    </p>
  );
}
