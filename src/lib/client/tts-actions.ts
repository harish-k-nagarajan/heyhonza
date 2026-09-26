"use client";

import { applyRouteToAudioElement } from "@/lib/client/call-audio-route";

/**
 * Honza's voice, client side. Fetches audio bytes from `/api/tts` and plays
 * them — it never sees a provider key or hostname, which is the whole point of
 * routing TTS through our own handler.
 *
 * One `Audio` element at a time, module-level: two Honzas talking over each
 * other is worse than a dropped line, and ending a call has to be able to cut
 * him off mid-sentence.
 */

let current: HTMLAudioElement | null = null;
let currentUrl: string | null = null;

function teardown() {
  if (current) {
    current.pause();
    current.src = "";
    current = null;
  }
  if (currentUrl) {
    URL.revokeObjectURL(currentUrl);
    currentUrl = null;
  }
}

/** Cut Honza off — used when a call ends or the user starts talking again. */
export function stopSpeaking() {
  teardown();
}

export class SpeechPlaybackError extends Error {}

export type SpeakOptions = {
  signal?: AbortSignal;
  /** Fires when the browser has actually started playback — use this to show captions. */
  onStart?: () => void;
};

export type PreparedSpeech = {
  play: (opts?: SpeakOptions) => Promise<void>;
};

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

async function fetchSpeechBlob(text: string, signal?: AbortSignal): Promise<Blob> {
  const res = await fetch("/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
    signal,
  });

  if (!res.ok) {
    let message = "Honza's voice is unavailable.";
    try {
      const data = (await res.json()) as { error?: string };
      if (data.error) message = data.error;
    } catch {
      /* non-JSON error body — keep the default */
    }
    throw new SpeechPlaybackError(message);
  }

  return res.blob();
}

function playPreparedAudio(audio: HTMLAudioElement, opts?: SpeakOptions): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    let settled = false;
    const finish = (error?: Error) => {
      if (settled) return;
      settled = true;
      opts?.signal?.removeEventListener("abort", onAbort);
      if (current === audio) teardown();
      if (error) reject(error);
      else resolve();
    };
    const onAbort = () => finish();

    audio.onended = () => finish();
    audio.onerror = () => finish(new SpeechPlaybackError("Playback failed."));
    opts?.signal?.addEventListener("abort", onAbort);

    void audio
      .play()
      .then(() => {
        opts?.onStart?.();
      })
      .catch(() => {
        finish(
          new SpeechPlaybackError(
            "Your browser blocked audio playback. Tap to start the call first.",
          ),
        );
      });
  });
}

/**
 * Fetch TTS bytes and hold them on the shared `Audio` element without playing.
 * Call `play()` when captions should appear — `onStart` fires at the same moment.
 */
export async function prepareSpeech(
  text: string,
  opts?: { signal?: AbortSignal },
): Promise<PreparedSpeech | null> {
  const trimmed = text.trim();
  if (!trimmed) return null;

  stopSpeaking();

  let blob: Blob;
  try {
    blob = await fetchSpeechBlob(trimmed, opts?.signal);
  } catch (error) {
    if (isAbortError(error) || opts?.signal?.aborted) return null;
    throw error;
  }
  if (opts?.signal?.aborted) return null;

  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  audio.playbackRate = 1;
  current = audio;
  currentUrl = url;

  await applyRouteToAudioElement(audio);

  return {
    play: async (playOpts) => {
      if (current !== audio) return;
      if (playOpts?.signal?.aborted) {
        teardown();
        return;
      }
      await applyRouteToAudioElement(audio);
      await playPreparedAudio(audio, playOpts);
    },
  };
}

/**
 * Speak `text` and resolve when playback finishes.
 *
 * Rejects with {@link SpeechPlaybackError} when the browser refuses to play —
 * overwhelmingly the autoplay policy, which requires that the *first* playback
 * descend from a user gesture. The call screen's "Call Honza" tap is that
 * gesture, so every later reply in the session inherits the unlock.
 */
export async function speak(text: string, opts?: SpeakOptions): Promise<void> {
  const prepared = await prepareSpeech(text, { signal: opts?.signal });
  if (!prepared) return;
  await prepared.play(opts);
}
