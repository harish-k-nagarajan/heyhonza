"use client";

import { cn } from "@/lib/cn";
import { TYPE } from "@/lib/design/typography";
import type { UiLocale } from "@/lib/i18n/locales";
import { useLocale } from "@/lib/i18n/useLocale";
import { DESIGNS } from "@/lib/design/registry";
import { useDesignStore } from "@/stores/useDesignStore";

/**
 * Compact Czech / English toggle. Used on welcome, sign-in, and Settings so UI
 * language is independent of the visual design family.
 */
export function LanguageSwitcher({
  className,
  variant = "default",
}: {
  className?: string;
  variant?: "default" | "nav";
}) {
  const { locale, setLocale, t } = useLocale();
  const isHmat = DESIGNS[useDesignStore((s) => s.design)].family === "hmat";
  const isNav = variant === "nav";

  const pill = (value: UiLocale, label: string) => {
    const active = locale === value;
    return (
      <button
        key={value}
        type="button"
        onClick={() => setLocale(value)}
        aria-pressed={active}
        className={cn(
          "transition",
          isNav
            ? cn(
                "rounded-full px-2.5 py-1 font-display text-[10px] font-bold tracking-[0.14em]",
                active ? "bg-white text-[#243D2C] shadow-[0_1px_3px_rgba(120,90,70,0.12)]" : "text-[#6B625C] hover:text-[#2A2420]",
              )
            : cn(
                "px-3 py-1.5",
                isHmat ? TYPE.label : "font-sans text-[11px] uppercase tracking-[0.14em]",
                active
                  ? isHmat
                    ? "rounded-full bg-accent/[0.14] text-accent"
                    : "rounded-full bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground",
              ),
        )}
      >
        {label}
      </button>
    );
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full p-0.5",
        isNav
          ? "bg-[#F5EDE7]"
          : cn("border border-border", isHmat && "mat-field border-0 p-1"),
        className,
      )}
      role="group"
      aria-label={t.settings.appLanguage}
    >
      {pill("cs", "CS")}
      {pill("en", "EN")}
    </div>
  );
}
