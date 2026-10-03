"use client";

import { useCallback, useContext } from "react";

import { LocaleBootContext } from "@/components/i18n/LocaleProvider";
import { useSettingsHydrated } from "@/hooks/useSettingsHydrated";
import { persistUiLocaleCookie } from "@/lib/i18n/locale-cookie";
import { getStrings, type UiLocale } from "@/lib/i18n/locales";
import { useSettingsStore } from "@/stores/useSettingsStore";

export function useLocale() {
  const boot = useContext(LocaleBootContext);
  const storeLocale = useSettingsStore((s) => s.uiLocale);
  const setStoreLocale = useSettingsStore((s) => s.setUiLocale);
  const hydrated = useSettingsHydrated();
  const locale = hydrated ? storeLocale : (boot ?? storeLocale);

  const setLocale = useCallback(
    (next: UiLocale) => {
      setStoreLocale(next);
      persistUiLocaleCookie(next);
    },
    [setStoreLocale],
  );

  return { locale, setLocale, t: getStrings(locale) };
}

export type { UiLocale };
