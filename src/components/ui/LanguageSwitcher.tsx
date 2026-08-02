"use client";

import { cn } from "@/lib/cn";
import { TYPE } from "@/lib/design/typography";
import type { UiLocale } from "@/lib/i18n/locales";
import { useLocale } from "@/lib/i18n/useLocale";
import { DESIGNS } from "@/lib/design/registry";
import { useDesignStore } from "@/stores/useDesignStore";

/**
 * Compact Czech / English toggle. Used on sign-in and in Settings so UI language
 * is independent of the visual design family.
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale, t } = useLocale();
  const isHmat = DESIGNS[useDesignStore((s) => s.design)].family === "hmat";

  const pill = (value: UiLocale, label: string) => (
    <button
      key={value}
      type="button"
      onClick={() => setLocale(value)}
      aria-pressed={locale === value}
      className={cn(
        "px-3 py-1.5 transition",
        isHmat ? TYPE.label : "font-sans text-[11px] uppercase tracking-[0.14em]",
        locale === value
          ? isHmat
            ? "rounded-full bg-accent/[0.14] text-accent"
            : "rounded-full bg-accent text-accent-foreground"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
    </button>
  );

  return (
    <div
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full border border-border p-0.5",
        isHmat && "mat-field border-0 p-1",
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
