"use client";

import { createContext, type ReactNode } from "react";

import type { UiLocale } from "@/lib/i18n/locales";

/** Locale from the request cookie — used until zustand persist hydrates. */
export const LocaleBootContext = createContext<UiLocale | null>(null);

export function LocaleProvider({
  locale,
  children,
}: {
  locale: UiLocale;
  children: ReactNode;
}) {
  return <LocaleBootContext.Provider value={locale}>{children}</LocaleBootContext.Provider>;
}
