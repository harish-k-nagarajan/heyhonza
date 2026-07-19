import Link from "next/link";

import {
  LANDING_HERO_FIRST,
  LANDING_HERO_SIGNED_OUT,
} from "@/components/screens/welcome/welcome-content";
import { ROUTES } from "@/lib/constants";

import type { LandingVisitor } from "./useLandingVisitor";

export function LandingStickyCta({ visitor }: { visitor: LandingVisitor }) {
  const ctaLabel = visitor.isSignedOut ? LANDING_HERO_SIGNED_OUT.cta : LANDING_HERO_FIRST.cta;

  return (
    <div className="landing-sticky-cta md:hidden">
      <Link
        href={ROUTES.signin}
        className="mat-key press mx-auto flex w-full max-w-app items-center justify-center rounded-full py-3.5 font-display text-xs uppercase tracking-[0.2em] text-accent"
      >
        {ctaLabel}
      </Link>
    </div>
  );
}
