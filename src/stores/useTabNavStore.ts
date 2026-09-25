import { create } from "zustand";

/**
 * Optimistic dock tab. `router.push` waits on the App Router RSC flight, so
 * the previous screen would otherwise stay on screen until `/chat` / `/call`
 * / `/settings` resolves. The dock writes `pendingHref` on tap; `HmatTabStage`
 * paints that tab immediately.
 */
type TabNavState = {
  pendingHref: string | null;
  setPendingHref: (href: string | null) => void;
};

export const useTabNavStore = create<TabNavState>((set) => ({
  pendingHref: null,
  setPendingHref: (pendingHref) => set({ pendingHref }),
}));
