"use client";

import { clearLocalUserState } from "@/lib/client/local-user-state";
import { ROUTES } from "@/lib/constants";
import { useSyncStore } from "@/stores/useSyncStore";

/**
 * End the session and open the marketing page.
 * A full navigation is required: clearing onboarding flags while Settings is
 * still mounted makes the signed-in app replace the route with /onboarding
 * and aborts the sign-out request.
 */
export async function signOutToWelcome(): Promise<void> {
  useSyncStore.getState().beginSignOut();
  try {
    await fetch("/auth/signout", {
      method: "POST",
      credentials: "include",
      redirect: "manual",
    });
  } catch {
    // Still leave the app if the request fails.
  }
  clearLocalUserState();
  window.location.replace(`${ROUTES.welcome}?signedOut=1`);
}
