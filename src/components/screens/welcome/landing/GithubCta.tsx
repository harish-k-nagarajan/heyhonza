"use client";

import { cn } from "@/lib/cn";
import { TYPE } from "@/lib/design/typography";
import { useLocale } from "@/lib/i18n/useLocale";
import { GITHUB_REPO_URL } from "@/lib/site-mode";

function GithubMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className={cn("size-4 shrink-0", className)}
    >
      <path
        fill="currentColor"
        d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"
      />
    </svg>
  );
}

export function GithubCta({
  stars,
  variant,
  className,
}: {
  stars: number | null;
  variant: "nav" | "primary" | "sticky";
  className?: string;
}) {
  const { locale, t } = useLocale();
  const label = t.welcome.viewOnGithub;
  const formatted =
    stars == null
      ? null
      : new Intl.NumberFormat(locale, {
          notation: "compact",
          maximumFractionDigits: 1,
        }).format(stars);

  const variantClass =
    variant === "nav"
      ? cn(
          "auth-cta-secondary inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2 sm:px-[18px]",
          TYPE.bodySm,
          "font-semibold",
        )
      : variant === "sticky"
        ? cn(
            "auth-cta-primary mx-auto flex w-full max-w-app items-center justify-center gap-2 rounded-full py-3.5",
            "font-sans text-[15px] font-semibold",
          )
        : "auth-cta-primary inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 font-sans text-[15px] font-semibold";

  return (
    <a
      href={GITHUB_REPO_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(variantClass, className)}
      aria-label={formatted == null ? label : `${label} (${formatted})`}
    >
      <GithubMark />
      <span>{label}</span>
      {formatted != null ? (
        <span className="tabular-nums opacity-80">{formatted}</span>
      ) : null}
    </a>
  );
}
