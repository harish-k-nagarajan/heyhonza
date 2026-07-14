import type { NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  /*
   * Run on all request paths except static assets, images, favicon, PWA
   * worker files, and the auth callback (which manages its own cookies).
   */
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon|manifest.json|sw.js|workbox-|worker-|.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico|txt)$).*)",
  ],
};
