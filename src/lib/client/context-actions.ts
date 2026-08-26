"use client";

import { patchServerState } from "@/lib/client/state-sync";
import { useChatStore } from "@/stores/useChatStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import type { ContextSource } from "@/types";
import type { ProfilePatch } from "@/lib/server/user-data";

/**
 * Mutations that must land in both the local Zustand store (instant UI) and the
 * per-user DB (survives refresh / re-login). In local pass-through dev the
 * server calls no-op and only the local store changes — one code path, both
 * modes. Onboarding and Settings share these so there's one data model.
 */

/** Persist a profile field change (topics / level / model / onboarding flag). */
export function persistProfile(patch: ProfilePatch): void {
  void patchServerState({ profile: patch });
}

/** Add an ingested context chunk locally and (when signed in) to the DB. */
export async function addContext(text: string, meta: ContextSource): Promise<void> {
  const { persisted, added } = await patchServerState({ addContext: { text, meta } });
  if (persisted && added) {
    useSettingsStore
      .getState()
      .addContextChunk(text, { ...meta, addedAt: added.syncedAt }, added.id);
  } else {
    useSettingsStore.getState().addContextChunk(text, meta);
  }
}

/** Replace the existing chunk of this source kind (paste / doc / file). */
export async function upsertContext(text: string, meta: ContextSource): Promise<void> {
  const { persisted, added } = await patchServerState({ upsertContext: { text, meta } });
  if (persisted && added) {
    useSettingsStore
      .getState()
      .replaceContextByKind(text, { ...meta, addedAt: added.syncedAt }, added.id);
  } else {
    useSettingsStore.getState().replaceContextByKind(text, meta);
  }
}

export async function removeContext(id: string): Promise<void> {
  await patchServerState({ removeContextId: id });
  useSettingsStore.getState().removeContextChunk(id);
}

/** Wipe this user's data (chat + context) and re-arm onboarding (data doctrine §5). */
export async function resetUserData(): Promise<void> {
  await patchServerState({ reset: true });
  useChatStore.getState().reset();
  useSettingsStore.getState().reset();
}
