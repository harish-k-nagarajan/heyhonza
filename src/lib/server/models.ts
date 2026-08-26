import { DEFAULT_MODEL_ID } from "@/lib/constants";

import { isKnownOpenRouterModel } from "./openrouter-models";

export async function resolveModel(requested: string | undefined): Promise<string> {
  const fallback = process.env.HONZA_DEFAULT_MODEL?.trim() || DEFAULT_MODEL_ID;
  if (!requested?.trim()) return fallback;
  const id = requested.trim();
  if (await isKnownOpenRouterModel(id)) return id;
  return fallback;
}
