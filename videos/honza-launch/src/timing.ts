import {LINES} from "./copy";

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

export const PHONE_W = 430;
export const PHONE_H = 860;

/** Chat and call stage, unscaled, beside the rail. */
export const PHONE_SCALE = 1;

export const DURATION_IN_FRAMES = 1800;

export type Cue = {at: number; text: string};

export const RAILS = {
  prague: [
    {at: 0, text: LINES.prague[0]},
    {at: 45, text: LINES.prague[1]},
    {at: 120, text: LINES.prague[2]},
    {at: 165, text: LINES.prague[3]},
    {at: 230, text: LINES.prague[4]},
    {at: 280, text: LINES.prague[5]},
  ],
  intro: [
    {at: 310, text: LINES.intro[0]},
    {at: 360, text: LINES.intro[1]},
    {at: 400, text: LINES.intro[2]},
    {at: 460, text: LINES.intro[3]},
    {at: 520, text: LINES.intro[4]},
  ],
  notes: [
    {at: 540, text: LINES.notes[0]},
    {at: 600, text: LINES.notes[1]},
    {at: 680, text: LINES.notes[2]},
  ],
  chat: [{at: 760, text: LINES.chat[0]}],
  call: [
    {at: 840, text: LINES.call[0]},
    {at: 920, text: LINES.call[1]},
  ],
  notify: [
    {at: 1080, text: LINES.notify[0]},
    {at: 1150, text: LINES.notify[1]},
    {at: 1200, text: LINES.notify[2]},
  ],
  close: [{at: 1280, text: LINES.close[0]}],
} as const;

/**
 * Sole frame authority for picture, copy, and mood.
 * Chapter first-lines land on introIn / docIn / chatIn / callIn / notifyIn / lockup.
 */
export const BEATS = {
  pragueExit: 300,
  introIn: 310,
  introSettled: 352,
  introTitle: 360,
  notesMove: 528,
  docIn: 540,
  docBody: 548,
  knedlikyMark: 620,
  chatMove: 748,
  chatIn: 760,
  honzaOpen: 764,
  typeStart: 772,
  send: 790,
  userBubble: 792,
  fix: 804,
  /** Call morph starts just before the rail hero so the UI is dominant at 840. */
  callMove: 820,
  callIn: 840,
  callSpeak: 848,
  lockMove: 1068,
  notifyIn: 1080,
  bannerAt: 1150,
  closeIn: 1280,
  lockup: 1360,
  endCta: 1388,
} as const;