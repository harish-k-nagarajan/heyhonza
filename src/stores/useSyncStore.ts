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
  markChecked: (dbMode: boolean) => void;
};

export const useSyncStore = create<SyncState>((set) => ({
  checked: false,
  dbMode: false,
  markChecked: (dbMode) => set({ checked: true, dbMode }),
}));
