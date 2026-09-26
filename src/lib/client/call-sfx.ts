"use client";

import { applyRouteToAudioElement } from "@/lib/client/call-audio-route";

/**
 * Call-screen sound effects — dial while connecting, pickup on connect, hangup on disconnect.
 * Separate from TTS so they never fight the same `Audio` element.
 * Assets live in `public/audio/call/`.
 */

const DIAL_SRC = "/audio/call/dial.mp3";
const PICKUP_SRC = "/audio/call/pickup.mp3";
const HANGUP_SRC = "/audio/call/hangup.mp3";
/** ~14 s source → ~9.3 s wall time at 1.5×. */
const DIAL_PLAYBACK_RATE = 1.5;

let dialAudio: HTMLAudioElement | null = null;
let pickupAudio: HTMLAudioElement | null = null;
let hangupAudio: HTMLAudioElement | null = null;

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

/** Full dial tone once at 1.5× before Honza's first spoken line. */
export async function playDialSound(): Promise<void> {
  if (!sfxAllowed()) return;
  stopDialSound();
  const audio = new Audio(DIAL_SRC);
  audio.playbackRate = DIAL_PLAYBACK_RATE;
  dialAudio = audio;
  await applyRouteToAudioElement(audio);
  await new Promise<void>((resolve) => {
    const done = () => {
      if (dialAudio === audio) dialAudio = null;
      resolve();
    };
    audio.onended = done;
    audio.onerror = done;
    audio.play().catch(done);
  });
}

export function stopDialSound(): void {
  stopElement(dialAudio);
  dialAudio = null;
}

/** Short "line connected" tone after dial, before Honza's first spoken line. */
export async function playPickupSound(): Promise<void> {
  if (!sfxAllowed()) return;
  stopPickupSound();
  const audio = new Audio(PICKUP_SRC);
  audio.playbackRate = 1;
  pickupAudio = audio;
  await applyRouteToAudioElement(audio);
  await new Promise<void>((resolve) => {
    const done = () => {
      if (pickupAudio === audio) pickupAudio = null;
      resolve();
    };
    audio.onended = done;
    audio.onerror = done;
    audio.play().catch(done);
  });
}

export function stopPickupSound(): void {
  stopElement(pickupAudio);
  pickupAudio = null;
}

/** Disconnect tone when the learner hangs up — fire-and-forget. */
export function playHangupSound(): void {
  if (!sfxAllowed()) return;
  if (hangupAudio) {
    stopElement(hangupAudio);
    hangupAudio = null;
  }
  const audio = new Audio(HANGUP_SRC);
  audio.playbackRate = 1;
  hangupAudio = audio;
  void applyRouteToAudioElement(audio).then(() => {
    const done = () => {
      if (hangupAudio === audio) hangupAudio = null;
    };
    audio.onended = done;
    audio.onerror = done;
    audio.play().catch(done);
  });
}

export function stopAllCallSfx(): void {
  stopDialSound();
  stopPickupSound();
  if (hangupAudio) {
    stopElement(hangupAudio);
    hangupAudio = null;
  }
}

