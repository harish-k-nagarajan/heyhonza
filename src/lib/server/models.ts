import { DEFAULT_MODEL_ID, MODEL_OPTIONS } from "@/lib/constants";

export const ALLOWED_MODEL_IDS = MODEL_OPTIONS.map((m) => m.id) as readonly string[];

export function resolveModel(requested: string | undefined): string {
  const fallback = process.env.HONZA_DEFAULT_MODEL ?? DEFAULT_MODEL_ID;
  if (!requested) return fallback;
  return ALLOWED_MODEL_IDS.includes(requested) ? requested : fallback;
}
