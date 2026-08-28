import "server-only";

import { MODEL_OPTIONS } from "@/lib/constants";

export type CatalogModel = {
  id: string;
  label: string;
  free: boolean;
};

export function curatedCatalog(): CatalogModel[] {
  return MODEL_OPTIONS.map((m) => ({
    id: m.id,
    label: m.label,
    free: m.free,
  }));
}

export async function fetchOpenRouterCatalog(): Promise<CatalogModel[]> {
  return curatedCatalog();
}

export async function isKnownOpenRouterModel(id: string): Promise<boolean> {
  if (MODEL_OPTIONS.some((m) => m.id === id)) return true;
  return /^[a-z0-9._-]+\/[a-z0-9._:/-]+$/i.test(id);
}
