import { ROUTES } from "@/lib/constants";

/** Chat / Call / Settings roots — not history or account sub-routes. */
export function isHmatMainTab(pathname: string): boolean {
  return (
    pathname === ROUTES.chat ||
    pathname === ROUTES.call ||
    pathname === ROUTES.settings
  );
}

export function displayTabHref(pathname: string, pendingHref: string | null): string {
  if (pendingHref && isHmatMainTab(pendingHref)) return pendingHref;
  return pathname;
}
