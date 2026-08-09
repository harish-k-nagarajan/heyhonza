"use client";

import { applyRouteToAudioElement } from "@/lib/client/call-audio-route";

/**
 * Call-screen sound effects — ring, pickup, hangup. Separate from TTS so they
 * never fight the same `Audio` element. Assets live in `public/audio/call/`.
 */

const RING_SRC = "/audio/call/ring.mp3";
const PICKUP_SRC = "/audio/call/pickup.mp3";
const HANGUP_SRC = "/audio/call/hangup.mp3";

let ringAudio: HTMLAudioElement | null = null;
let oneShotAudio: HTMLAudioElement | null = null;

function sfxAllowed(): boolean {
  if (typeof window === "undefined") return false;
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function stopElement(audio: HTMLAudioElement | null) {
  if (!audio) return;
  audio.pause();
  audio.currentTime = 0;
  audio.onended = null;
}

/** Looping ring while Honza's opener is fetched (`connecting` phase). */
export function playCallRing(): void {
  if (!sfxAllowed()) return;
  stopCallRing();
  const audio = new Audio(RING_SRC);
  audio.loop = true;
  ringAudio = audio;
  void applyRouteToAudioElement(audio);
  audio.play().catch(() => {
    if (ringAudio === audio) stopCallRing();
  });
}

export function stopCallRing(): void {
  stopElement(ringAudio);
  ringAudio = null;
}

/** Short connect tone before Honza's first spoken line. */
export async function playPickupSound(): Promise<void> {
  if (!sfxAllowed()) return;
  await playOneShot(PICKUP_SRC);
}

/** Disconnect tone when the learner hangs up — fire-and-forget. */
export function playHangupSound(): void {
  if (!sfxAllowed()) return;
  void playOneShot(HANGUP_SRC);
}

async function playOneShot(src: string): Promise<void> {
  if (oneShotAudio) {
    stopElement(oneShotAudio);
    oneShotAudio = null;
  }
  const audio = new Audio(src);
  oneShotAudio = audio;
  await applyRouteToAudioElement(audio);
  await new Promise<void>((resolve) => {
    const done = () => {
      if (oneShotAudio === audio) oneShotAudio = null;
      resolve();
    };
    audio.onended = done;
    audio.onerror = done;
    audio.play().catch(done);
  });
}

export function stopAllCallSfx(): void {
  stopCallRing();
  if (oneShotAudio) {
    stopElement(oneShotAudio);
    oneShotAudio = null;
  }
}

/** Re-route ring / one-shot SFX when the learner toggles speaker mid-call. */
export async function reapplyCallSfxRoute(): Promise<void> {
  if (ringAudio) await applyRouteToAudioElement(ringAudio);
  if (oneShotAudio) await applyRouteToAudioElement(oneShotAudio);
}
