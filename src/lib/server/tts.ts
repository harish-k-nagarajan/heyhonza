import "server-only";

/**
 * Text-to-speech — the one place that talks to the voice provider.
 *
 * Mirrors `conversation-engine.ts` in shape and doctrine: the provider key is
 * read here and **never** leaves the server (CLAUDE.md Hard Rule 2). The browser
 * only ever sees audio bytes from `/api/tts`, never a key and never the
 * provider's hostname.
 *
 * ---
 * ## Swapping providers
 *
 * Everything provider-specific is inside `synthesizeSpeech` and the three
 * constants below. To move off ElevenLabs, reimplement `synthesizeSpeech` to
 * return `{ audio, contentType }` and keep throwing {@link TtsError} for
 * failures — no caller changes, because `/api/tts` and the call screen only know
 * about this contract. Concretely:
 *
 * - **OpenAI** (`POST /v1/audio/speech`, `{ model: "gpt-4o-mini-tts", voice,
 *   input }` → mp3): cheaper per character, but noticeably weaker Czech
 *   pronunciation — a real cost for a product whose job is modelling Czech.
 * - **Azure Speech** (`cs-CZ-AntoninNeural` is a native Czech voice): best
 *   accent, more setup (region + token exchange).
 *
 * ## A note on the voice, and why there's a fallback
 *
 * ElevenLabs' free tier **cannot use library ("professional") voices via the
 * API** — those 402 with `paid_plan_required`, even though they're visible in
 * the dashboard and the voice lookup endpoint returns them happily. Premade
 * voices work on every tier. Since the multilingual models speak Czech with any
 * voice, a premade voice is a workable free-tier default; it just carries an
 * English accent, because every premade voice is `language: en`.
 *
 * So: `ELEVENLABS_VOICE_ID` wins when set, and if that voice turns out to need a
 * paid plan we fall back to {@link FALLBACK_VOICE_ID} and warn loudly rather
 * than leaving Honza mute. On a paid plan the configured Czech voice is used as
 * intended, with no code change.
 */

const ELEVENLABS_BASE_URL = "https://api.elevenlabs.io/v1";
const REQUEST_TIMEOUT_MS = 20_000;

/** Honza's replies are short by design; this is a cost guard, not a limit. */
export const MAX_TTS_CHARS = 1_000;

/**
 * "Chris — Charming, Down-to-Earth", a premade male conversational voice. Chosen
 * because premade voices work on the free tier and this one's register (warm,
 * casual) is the closest match to Honza. Speaks Czech via the multilingual model
 * below, with an English accent — see the module note.
 */
const FALLBACK_VOICE_ID = "iP95p4xoKVk53GoZ742B";

/**
 * `eleven_multilingual_v2` is the highest-quality multilingual model and Czech
 * is in its language set. `eleven_turbo_v2_5` / `eleven_flash_v2_5` also speak
 * Czech at roughly half the character cost and lower latency — worth switching
 * to if the free tier's 10k chars/month bites, at some cost to pronunciation.
 * Pronunciation is the product here, so quality wins by default.
 */
const TTS_MODEL_ID = "eleven_multilingual_v2";

export type TtsErrorKind =
  | "not_configured"
  | "auth"
  | "rate_limited"
  | "quota"
  | "timeout"
  | "empty"
  | "upstream";

/** Typed failure so the route can map to a friendly status + message. */
export class TtsError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly kind: TtsErrorKind,
  ) {
    super(message);
    this.name = "TtsError";
  }
}

export function isTtsConfigured(): boolean {
  return Boolean(process.env.ELEVENLABS_API_KEY);
}

/** The voice we'll *try* first. Not necessarily the one that ends up speaking. */
export function configuredVoiceId(): string {
  return process.env.ELEVENLABS_VOICE_ID?.trim() || FALLBACK_VOICE_ID;
}

let warnedAboutPaidVoice = false;

type SynthResult = { audio: ArrayBuffer; contentType: string; voiceId: string };

async function requestSpeech(
  text: string,
  voiceId: string,
  apiKey: string,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(
      `${ELEVENLABS_BASE_URL}/text-to-speech/${encodeURIComponent(voiceId)}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text,
          model_id: TTS_MODEL_ID,
          // Slightly above default stability so a tutor's speech is steady and
          // predictable rather than performative — learners are copying it.
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
        signal: controller.signal,
        cache: "no-store",
      },
    );
  } finally {
    clearTimeout(timer);
  }
}

/** Read a JSON error body without letting a non-JSON body throw. */
async function errorDetail(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as {
      detail?: { message?: string; status?: string } | string;
    };
    if (typeof body.detail === "string") return body.detail;
    return body.detail?.message ?? body.detail?.status ?? "";
  } catch {
    return "";
  }
}

/**
 * Synthesize Honza's spoken Czech. Throws {@link TtsError} on any failure so the
 * caller can produce a friendly response.
 */
export async function synthesizeSpeech(text: string): Promise<SynthResult> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new TtsError(
      "ELEVENLABS_API_KEY is missing on the server (e.g. Vercel env).",
      503,
      "not_configured",
    );
  }

  const trimmed = text.trim().slice(0, MAX_TTS_CHARS);
  if (!trimmed) throw new TtsError("Nothing to speak.", 400, "empty");

  const wanted = configuredVoiceId();

  let res: Response;
  try {
    res = await requestSpeech(trimmed, wanted, apiKey);
  } catch (e) {
    if ((e as { name?: string }).name === "AbortError") {
      throw new TtsError("Honza's voice took too long. Try again.", 504, "timeout");
    }
    throw new TtsError(
      e instanceof Error ? e.message : "Unknown voice error.",
      502,
      "upstream",
    );
  }

  // A library/professional voice on a free plan. Fall back so the call still
  // works, but say exactly what happened and how to fix it properly.
  if (res.status === 402 && wanted !== FALLBACK_VOICE_ID) {
    if (!warnedAboutPaidVoice) {
      warnedAboutPaidVoice = true;
      console.warn(
        `[tts] ELEVENLABS_VOICE_ID=${wanted} needs a paid ElevenLabs plan ` +
          `(free tier can't use library voices via the API). Falling back to the ` +
          `premade voice ${FALLBACK_VOICE_ID}, which speaks Czech with an English ` +
          `accent. Upgrade the plan to use the configured voice — no code change needed.`,
      );
    }
    try {
      res = await requestSpeech(trimmed, FALLBACK_VOICE_ID, apiKey);
    } catch {
      throw new TtsError("Honza's voice is unavailable right now.", 502, "upstream");
    }
    return finish(res, FALLBACK_VOICE_ID);
  }

  return finish(res, wanted);
}

async function finish(res: Response, voiceId: string): Promise<SynthResult> {
  if (!res.ok) {
    const detail = await errorDetail(res);
    if (res.status === 401) {
      throw new TtsError("Server auth error contacting the voice provider.", 502, "auth");
    }
    if (res.status === 402) {
      throw new TtsError(
        detail || "Honza's voice needs a paid plan or has run out of credits.",
        502,
        "quota",
      );
    }
    if (res.status === 429) {
      throw new TtsError("Honza's voice is busy. Try again in a moment.", 429, "rate_limited");
    }
    throw new TtsError(detail || `Voice provider error (${res.status}).`, 502, "upstream");
  }

  const audio = await res.arrayBuffer();
  if (audio.byteLength === 0) {
    throw new TtsError("The voice provider returned no audio.", 502, "empty");
  }
  return {
    audio,
    contentType: res.headers.get("content-type") ?? "audio/mpeg",
    voiceId,
  };
}
