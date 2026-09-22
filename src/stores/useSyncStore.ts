import { create } from "zustand";

/**
 * Tracks whether the initial server-state check has completed and whether we're
 * in DB mode. Pages gate their onboarding redirects on `checked` so a signed-in
 * user with stale localStorage isn't briefly bounced to onboarding before the
 * DB truth (from `/api/state`) arrives.
 */
type SyncState = {
  checked: boolean;
  dbMode: boolean;
  /** True once sign-out starts, until the next full page load. */
  signingOut: boolean;
  resetChecked: () => void;
  markChecked: (dbMode: boolean) => void;
  beginSignOut: () => void;
};

export const useSyncStore = create<SyncState>((set) => ({
  checked: false,
  dbMode: false,
  signingOut: false,
  resetChecked: () => set({ checked: false, dbMode: false }),
  markChecked: (dbMode) =>
    set((state) =>
      state.signingOut ? { checked: true, dbMode: false } : { checked: true, dbMode },
    ),
  beginSignOut: () => set({ signingOut: true, checked: true, dbMode: false }),
}));
