import { ROUTES } from "@/lib/constants";

/** Public GitHub repo. Star count stays hidden until this repo is public. */
export const GITHUB_REPO = "harish-k-nagarajan/heyhonza";
export const GITHUB_REPO_URL = `https://github.com/${GITHUB_REPO}`;

/**
 * Public showcase deploy. Unset on the private app, so login and chat stay.
 * `NEXT_PUBLIC_` so the landing buttons can read it in the browser bundle.
 * Changing it locally needs a dev-server restart.
 */
export function isShowcaseMode(): boolean {
  return process.env.NEXT_PUBLIC_SITE_MODE === "showcase";
}

/** App and auth pages. Showcase sends these back to the landing page. */
const SHOWCASE_BLOCKED_PREFIXES = [
  ROUTES.signup,
  ROUTES.login,
  ROUTES.signin,
  ROUTES.chat,
  ROUTES.call,
  ROUTES.settings,
  ROUTES.onboarding,
  "/auth",
] as const;

export function showcaseBlocksPath(pathname: string): boolean {
  if (pathname === ROUTES.home) return true;
  return SHOWCASE_BLOCKED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
