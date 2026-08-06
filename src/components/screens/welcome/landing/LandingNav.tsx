import Link from "next/link";

import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/cn";
import { TYPE } from "@/lib/design/typography";

export function LandingNav() {
  return (
    <nav className="landing-nav sticky top-0 z-20 flex items-center justify-between px-6 py-6 md:px-10">
      <Link
        href={ROUTES.welcome}
        className="font-display text-[22px] font-bold tracking-[0.04em] text-accent"
      >
        Honza
      </Link>
      <Link
        href={ROUTES.signin}
        className={cn(
          "inline-flex items-center justify-center rounded-full border border-border bg-white px-5 py-2.5",
          TYPE.bodySm,
          "font-semibold text-foreground",
        )}
      >
        Log in
      </Link>
    </nav>
  );
}
