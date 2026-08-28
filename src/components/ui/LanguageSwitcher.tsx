"use client";

import { cn } from "@/lib/cn";
import { TYPE } from "@/lib/design/typography";
import type { UiLocale } from "@/lib/i18n/locales";
import { useLocale } from "@/lib/i18n/useLocale";
import { DESIGNS } from "@/lib/design/registry";
import { useDesignStore } from "@/stores/useDesignStore";
import { useSlidingPill } from "@/hooks/useSlidingPill";

/**
 * Compact Czech / English toggle. Used on sign-in and in Settings so UI language
 * is independent of the visual design family.
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale, t } = useLocale();
  const isHmat = DESIGNS[useDesignStore((s) => s.design)].family === "hmat";
  const options: { value: UiLocale; label: string }[] = [
    { value: "cs", label: "CS" },
    { value: "en", label: "EN" },
  ];
  const activeIndex = locale === "en" ? 1 : 0;
  const { barRef, pillRef, setItemRef } = useSlidingPill(activeIndex, locale);

  return (
    <div
      ref={barRef}
      className={cn(
        "hmat-tabs hmat-lang-tabs relative inline-flex items-center gap-0.5 rounded-full border border-border p-0.5",
        isHmat && "mat-field border-0 p-1",
        className,
      )}
      role="group"
      aria-label={t.settings.appLanguage}
    >
      <span
        ref={pillRef}
        className="hmat-tabs-pill"
        aria-hidden
        style={!isHmat ? { background: "var(--accent)", borderRadius: 9999 } : undefined}
      />
      {options.map((option, i) => (
        <button
          key={option.value}
          ref={setItemRef(i)}
          type="button"
          onClick={() => setLocale(option.value)}
          aria-pressed={locale === option.value}
          className={cn(
            "hmat-tab-btn relative z-[1] px-3 py-1.5",
            isHmat ? TYPE.label : "font-sans text-[11px] uppercase tracking-[0.14em]",
            locale === option.value
              ? isHmat
                ? "text-accent"
                : "text-accent-foreground"
              : "text-muted-foreground",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
