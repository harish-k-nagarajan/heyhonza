import { ButtonLink } from "@/components/ui/ButtonLink";
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
      <ButtonLink
        href={ROUTES.signin}
        shape="pill"
        size="lg"
        className="mx-auto flex w-full max-w-app"
      >
        {ctaLabel}
      </ButtonLink>
    </div>
  );
}
