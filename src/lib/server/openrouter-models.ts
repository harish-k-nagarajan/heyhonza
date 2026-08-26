import "server-only";

import { MODEL_OPTIONS } from "@/lib/constants";

const OPENROUTER_MODELS_URL = "https://openrouter.ai/api/v1/models";
const CACHE_MS = 60 * 60 * 1000;
const MAX_FREE = 36;

export type CatalogModel = { id: string; label: string; free: boolean };

type OpenRouterModel = {
  id?: string;
  name?: string;
  pricing?: { prompt?: string; completion?: string };
};

let cache: { at: number; models: CatalogModel[] } | null = null;

function isFree(m: OpenRouterModel): boolean {
  const id = m.id ?? "";
  if (id.endsWith(":free")) return true;
  const prompt = Number(m.pricing?.prompt ?? "1");
  const completion = Number(m.pricing?.completion ?? "1");
  return prompt === 0 && completion === 0;
}

function labelFor(m: OpenRouterModel): string {
  const id = m.id ?? "";
  const name = (m.name ?? "").trim();
  if (name && name !== id) return name;
  const slug = id.split("/").pop() ?? id;
  return slug.replace(/:free$/, " (free)");
}

export async function fetchOpenRouterCatalog(): Promise<CatalogModel[]> {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.models;

  const curated: CatalogModel[] = MODEL_OPTIONS.map((m) => ({
    id: m.id,
    label: m.label,
    free: false,
  }));

  try {
    const res = await fetch(OPENROUTER_MODELS_URL, {
      headers: { Accept: "application/json" },
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      cache = { at: Date.now(), models: curated };
      return curated;
    }
    const body = (await res.json()) as { data?: OpenRouterModel[] };
    const free = (body.data ?? [])
      .filter((m) => typeof m.id === "string" && isFree(m))
      .map((m) => ({ id: m.id as string, label: labelFor(m), free: true }))
      .sort((a, b) => a.label.localeCompare(b.label))
      .slice(0, MAX_FREE);

    const seen = new Set<string>();
    const models: CatalogModel[] = [];
    for (const m of [...curated, ...free]) {
      if (seen.has(m.id)) continue;
      seen.add(m.id);
      models.push(m);
    }
    cache = { at: Date.now(), models };
    return models;
  } catch {
    cache = { at: Date.now(), models: curated };
    return curated;
  }
}

export async function isKnownOpenRouterModel(id: string): Promise<boolean> {
  const catalog = await fetchOpenRouterCatalog();
  if (catalog.some((m) => m.id === id)) return true;
  return /^[a-z0-9._-]+\/[a-z0-9._:/-]+$/i.test(id);
}
