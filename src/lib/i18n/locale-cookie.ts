import { DEFAULT_LOCALE, type UiLocale } from "@/lib/i18n/locales";

export const UI_LOCALE_COOKIE = "honza-ui-locale";

export function parseUiLocale(value: string | null | undefined): UiLocale {
  return value === "en" || value === "cs" ? value : DEFAULT_LOCALE;
}

/** Client-only. Keeps the next document request in the same UI language. */
export function persistUiLocaleCookie(locale: UiLocale): void {
  if (typeof document === "undefined") return;
  document.cookie = `${UI_LOCALE_COOKIE}=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`;
  document.documentElement.lang = locale;
  document.documentElement.setAttribute("data-ui-locale", locale);
}
