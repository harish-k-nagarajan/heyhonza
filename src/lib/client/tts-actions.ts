"use client";

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

/**
 * Speak `text` and resolve when playback finishes.
 *
 * Rejects with {@link SpeechPlaybackError} when the browser refuses to play —
 * overwhelmingly the autoplay policy, which requires that the *first* playback
 * descend from a user gesture. The call screen's "Call Honza" tap is that
 * gesture, so every later reply in the session inherits the unlock.
 */
export async function speak(text: string, opts?: { signal?: AbortSignal }): Promise<void> {
  const trimmed = text.trim();
  if (!trimmed) return;

  stopSpeaking();

  const res = await fetch("/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: trimmed }),
    signal: opts?.signal,
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

  const blob = await res.blob();
  if (opts?.signal?.aborted) return;

  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  current = audio;
  currentUrl = url;

  await new Promise<void>((resolve, reject) => {
    const done = () => {
      if (current === audio) teardown();
      resolve();
    };
    audio.onended = done;
    audio.onerror = () => {
      if (current === audio) teardown();
      reject(new SpeechPlaybackError("Playback failed."));
    };
    if (opts?.signal) {
      opts.signal.addEventListener("abort", () => {
        if (current === audio) teardown();
        resolve();
      });
    }
    audio.play().catch(() => {
      if (current === audio) teardown();
      reject(
        new SpeechPlaybackError(
          "Your browser blocked audio playback. Tap to start the call first.",
        ),
      );
    });
  });
}
