import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { ROUTES } from "@/lib/constants";

import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "./config";

/** Page routes that require an authenticated user. */
const PROTECTED_PREFIXES = [
  ROUTES.home,
  ROUTES.chat,
  ROUTES.settings,
  ROUTES.onboarding,
];

/** Routes an authenticated user should be bounced away from. */
const AUTH_ROUTES = [ROUTES.signin];

function isProtected(pathname: string): boolean {
  if (pathname === ROUTES.home) return true;
  return PROTECTED_PREFIXES.some(
    (p) => p !== ROUTES.home && (pathname === p || pathname.startsWith(`${p}/`)),
  );
}

/**
 * Refreshes the Supabase session cookie on every request and enforces route
 * protection. When Supabase isn't configured yet (scaffold-first), this is a
 * pass-through so the app still runs locally without keys.
 */
export async function updateSession(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // IMPORTANT: getUser() must be called to refresh the token; don't remove.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (!user && isProtected(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = ROUTES.signin;
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (user && AUTH_ROUTES.includes(pathname as (typeof AUTH_ROUTES)[number])) {
    const url = request.nextUrl.clone();
    url.pathname = ROUTES.home;
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}
