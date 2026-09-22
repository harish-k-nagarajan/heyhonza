"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/cn";
import { TYPE } from "@/lib/design/typography";
import type { UiLocale } from "@/lib/i18n/locales";
import { useLocale } from "@/lib/i18n/useLocale";

const LOCALE_CODES: Record<UiLocale, string> = {
  cs: "CS",
  en: "EN",
};

function dropdownCloseMs(): number {
  if (typeof window === "undefined") return 150;
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--dropdown-close-dur")
    .trim();
  const parsed = Number.parseFloat(raw);
  return Number.isFinite(parsed) ? parsed : 150;
}

/**
 * Compact Czech / English dropdown. Used on welcome, sign-in, and Settings so
 * UI language is independent of the visual design family.
 */
export function LanguageSwitcher({
  className,
  variant = "default",
}: {
  className?: string;
  variant?: "default" | "nav";
}) {
  const { locale, setLocale, t } = useLocale();
  const isNav = variant === "nav";
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const closeTimer = useRef<number>(0);
  const menuId = useId();
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const labels: Record<UiLocale, string> = {
    cs: t.settings.languageCs,
    en: t.settings.languageEn,
  };

  const openMenu = () => {
    window.clearTimeout(closeTimer.current);
    setClosing(false);
    setOpen(true);
  };

  const closeMenu = useCallback(() => {
    setOpen((wasOpen) => {
      if (!wasOpen) return false;
      setClosing(true);
      window.clearTimeout(closeTimer.current);
      closeTimer.current = window.setTimeout(() => {
        setClosing(false);
      }, dropdownCloseMs());
      return false;
    });
  }, []);

  const toggleMenu = () => {
    if (open) closeMenu();
    else openMenu();
  };

  const visible = open || closing;

  useLayoutEffect(() => {
    if (!visible) return undefined;

    const update = () => {
      const trigger = triggerRef.current;
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      setMenuPos({
        top: Math.round(rect.bottom + 8),
        right: Math.round(window.innerWidth - rect.right),
      });
    };

    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [visible]);

  useEffect(() => {
    if (!open) return undefined;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target) || menuRef.current?.contains(target)) {
        return;
      }
      closeMenu();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, closeMenu]);

  useEffect(() => {
    return () => window.clearTimeout(closeTimer.current);
  }, []);

  const choose = (value: UiLocale) => {
    setLocale(value);
    closeMenu();
  };

  const menu =
    mounted && visible
      ? createPortal(
          <div
            ref={menuRef}
            id={menuId}
            role="listbox"
            aria-label={t.settings.appLanguage}
            data-origin="top-right"
            className={cn(
              "t-dropdown fixed z-[80] min-w-[9.5rem] rounded-2xl border border-[#E8E2DC] bg-white p-1",
              open && "is-open",
              closing && "is-closing",
            )}
            style={{ top: menuPos.top, right: menuPos.right }}
          >
            {(["cs", "en"] as const).map((value) => {
              const active = locale === value;
              return (
                <button
                  key={value}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => choose(value)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition-colors",
                    TYPE.bodySm,
                    active
                      ? "bg-[#F5EDE7] font-semibold text-[#2A2420]"
                      : "text-[#4A443F] hover:bg-[#FFF8F5]",
                  )}
                >
                  <span>{labels[value]}</span>
                  <span className={cn(TYPE.meta, "text-[#9C9089]")}>{LOCALE_CODES[value]}</span>
                </button>
              );
            })}
          </div>,
          document.body,
        )
      : null;

  return (
    <div className={cn("relative", className)}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={t.settings.appLanguage}
        onClick={toggleMenu}
        className={cn(
          "inline-flex items-center gap-1 rounded-full text-[#6B625C] transition-colors hover:text-[#2A2420]",
          isNav
            ? "px-1.5 py-1 font-display text-[10px] font-bold tracking-[0.14em]"
            : cn("px-2.5 py-1.5", TYPE.label),
        )}
      >
        <span>{LOCALE_CODES[locale]}</span>
        <svg
          aria-hidden
          viewBox="0 0 12 12"
          className={cn(
            "h-2.5 w-2.5 shrink-0 transition-transform duration-[var(--dropdown-open-dur)] ease-[var(--dropdown-ease)]",
            open && "rotate-180",
          )}
        >
          <path
            d="M2.4 4.2 6 7.8l3.6-3.6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {menu}
    </div>
  );
}
