"use client";

/**
 * Call audio routing — best-effort `play-and-record` while a call is active so
 * mobile browsers may route TTS closer to a handset call. There is no reliable
 * web API to toggle earpiece vs loudspeaker (no `defaultToSpeaker` equivalent);
 * speaker toggle was removed from the UI for that reason.
 */

type AudioSessionNavigator = Navigator & {
  audioSession?: { type: string };
};

let callRouteActive = false;

export function beginCallAudioRoute(): void {
  callRouteActive = true;
  const nav = navigator as AudioSessionNavigator;
  if (nav.audioSession) {
    nav.audioSession.type = "play-and-record";
  }
}

export function resetCallAudioRoute(): void {
  callRouteActive = false;
  const nav = navigator as AudioSessionNavigator;
  if (nav.audioSession) {
    nav.audioSession.type = "auto";
  }
}

/** Apply call route to an audio element about to play. */
export async function applyRouteToAudioElement(audio: HTMLAudioElement): Promise<void> {
  if (!callRouteActive) return;
  const nav = navigator as AudioSessionNavigator;
  if (nav.audioSession) {
    nav.audioSession.type = "play-and-record";
  }
  audio.setAttribute("playsinline", "");
}
