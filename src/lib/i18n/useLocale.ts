"use client";

import { getStrings, type UiLocale } from "@/lib/i18n/locales";
import { useSettingsStore } from "@/stores/useSettingsStore";

export function useLocale() {
  const locale = useSettingsStore((s) => s.uiLocale);
  const setLocale = useSettingsStore((s) => s.setUiLocale);
  return { locale, setLocale, t: getStrings(locale) };
}

export type { UiLocale };
