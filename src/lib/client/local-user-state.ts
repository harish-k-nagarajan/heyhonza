import { useChatStore } from "@/stores/useChatStore";
import { useMoodStore } from "@/stores/useMoodStore";
import { useSettingsStore } from "@/stores/useSettingsStore";

const OWNER_KEY = "honza-owner-id";

/** Which auth user currently owns the localStorage-backed stores, if any. */
export function getLocalOwnerId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(OWNER_KEY);
}

export function setLocalOwnerId(userId: string | null): void {
  if (typeof window === "undefined") return;
  if (userId) window.localStorage.setItem(OWNER_KEY, userId);
  else window.localStorage.removeItem(OWNER_KEY);
}

function waitForPersistHydration(store: {
  persist: {
    hasHydrated: () => boolean;
    onFinishHydration: (fn: () => void) => () => void;
  };
}): Promise<void> {
  return new Promise((resolve) => {
    if (store.persist.hasHydrated()) {
      resolve();
      return;
    }
    const unsub = store.persist.onFinishHydration(() => {
      unsub();
      resolve();
    });
  });
}

/** Resolve after `honza-settings` and `honza-chat` have loaded from localStorage. */
export async function waitForLocalUserState(): Promise<void> {
  await Promise.all([
    waitForPersistHydration(useSettingsStore),
    waitForPersistHydration(useChatStore),
  ]);
}

/**
 * Drop the previous account's local settings/chat. Zustand persist keys are
 * global (`honza-settings`, `honza-chat`), so switching users without this
 * would show the last account's name and thread.
 */
export function clearLocalUserState(): void {
  const uiLocale = useSettingsStore.getState().uiLocale;
  useSettingsStore.getState().reset();
  useSettingsStore.getState().setUiLocale(uiLocale);
  useChatStore.getState().reset();
  useMoodStore.getState().reset();
  setLocalOwnerId(null);
}
