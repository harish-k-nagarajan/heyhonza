"use client";

/**
 * Call audio routing — earpiece by default (`play-and-record`), loudspeaker when
 * the learner toggles speaker (`playback`). Best-effort via Audio Session API;
 * optional `setSinkId` when enumerating outputs is available.
 */

let speakerOn = false;
let loudspeakerDeviceId: string | null = null;

type AudioSessionNavigator = Navigator & {
  audioSession?: { type: string };
};

type SinkCapableAudio = HTMLAudioElement & {
  setSinkId?: (deviceId: string) => Promise<void>;
};

export function setCallSpeakerPreference(on: boolean) {
  speakerOn = on;
}

export function getCallSpeakerPreference(): boolean {
  return speakerOn;
}

export function applyCallAudioRoute(speaker: boolean): void {
  speakerOn = speaker;
  const nav = navigator as AudioSessionNavigator;
  if (!nav.audioSession) return;
  nav.audioSession.type = speaker ? "playback" : "play-and-record";
}

export function resetCallAudioRoute(): void {
  speakerOn = false;
  loudspeakerDeviceId = null;
  const nav = navigator as AudioSessionNavigator;
  if (nav.audioSession) {
    nav.audioSession.type = "auto";
  }
}

async function resolveLoudspeakerDeviceId(): Promise<string | null> {
  if (loudspeakerDeviceId) return loudspeakerDeviceId;
  if (!navigator.mediaDevices?.enumerateDevices) return null;
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const outputs = devices.filter((d) => d.kind === "audiooutput");
    const loud =
      outputs.find((d) => /speaker|loud|default/i.test(d.label)) ?? outputs[0];
    if (loud?.deviceId) loudspeakerDeviceId = loud.deviceId;
  } catch {
    /* permission or unsupported — routing stays on session type only */
  }
  return loudspeakerDeviceId;
}

/** Apply current route to an audio element about to play. */
export async function applyRouteToAudioElement(audio: HTMLAudioElement): Promise<void> {
  applyCallAudioRoute(speakerOn);
  audio.setAttribute("playsinline", "");

  if (!speakerOn) return;

  const sinkAudio = audio as SinkCapableAudio;
  if (!sinkAudio.setSinkId) return;

  const deviceId = await resolveLoudspeakerDeviceId();
  if (!deviceId) return;

  try {
    await sinkAudio.setSinkId(deviceId);
  } catch {
    /* sink selection is optional */
  }
}
