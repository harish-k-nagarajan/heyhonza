import Link from "next/link";

import {
  LANDING_HERO_FIRST,
  LANDING_PWA_HINT,
} from "@/components/screens/welcome/welcome-content";
import { ROUTES } from "@/lib/constants";

export function LandingFooter() {
  return (
    <footer className="landing-section flex flex-col items-center gap-4 pb-6 text-center">
      <Link
        href={ROUTES.signin}
        className="mat-key press hidden w-full max-w-[360px] items-center justify-center rounded-full py-3.5 font-display text-xs uppercase tracking-[0.2em] text-accent md:flex"
      >
        {LANDING_HERO_FIRST.cta}
      </Link>
      <Link
        href={ROUTES.signin}
        className="font-display text-xs uppercase tracking-[0.2em] text-accent underline underline-offset-4 md:hidden"
      >
        Get started
      </Link>
      <p className="mx-auto max-w-[340px] font-sans text-xs leading-relaxed text-muted-foreground">
        {LANDING_PWA_HINT}
      </p>
    </footer>
  );
}
