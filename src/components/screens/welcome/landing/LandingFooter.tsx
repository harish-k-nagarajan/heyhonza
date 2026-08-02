import Link from "next/link";

import { ButtonLink } from "@/components/ui/ButtonLink";
import {
  LANDING_HERO_FIRST,
  LANDING_PWA_HINT,
} from "@/components/screens/welcome/welcome-content";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/cn";
import { TYPE } from "@/lib/design/typography";

export function LandingFooter() {
  return (
    <footer className="landing-section flex flex-col items-center gap-4 pb-6 text-center">
      <ButtonLink
        href={ROUTES.signin}
        shape="pill"
        size="lg"
        className="hidden w-full max-w-[360px] md:flex"
      >
        {LANDING_HERO_FIRST.cta}
      </ButtonLink>
      <Link
        href={ROUTES.signin}
        className={cn(TYPE.button, "text-accent underline underline-offset-4 md:hidden")}
      >
        Get started
      </Link>
      <p className={cn("mx-auto max-w-[340px]", TYPE.helper)}>{LANDING_PWA_HINT}</p>
    </footer>
  );
}
