import {LANDING_DEMO_CONVERSATION} from "@/components/screens/welcome/landing/landing-demo-conversation";
import {DEMO_CHAT_BEATS} from "@/components/screens/welcome/welcome-content";
import {getStrings} from "@/lib/i18n/locales";

const cs = getStrings("cs");
const food = DEMO_CHAT_BEATS[0];

export const TEACHER = "#1F6B4A";
export const YOU = "#B4532A";
export const GLOSS = "#8A8178";
export const INK = "#243D2C";

export type DocAuthor = "teacher" | "you";

export type DocBlock =
  | {kind: "head"; text: string; at: number}
  | {kind: "line"; author: DocAuthor; text: string; at: number};

export const DOC_TITLE = "Czech Lessons";
export const DOC_BYLINE = "Shared notes between teacher and student";

/** Running notes: sentences, exercises, Czech with the English beside it. */
export const DOC_BLOCKS: DocBlock[] = [
  {kind: "head", text: "Slovesa — Verbs", at: 0},
  {kind: "line", author: "teacher", text: "mít — to have", at: 4},
  {kind: "line", author: "teacher", text: "jíst — to eat", at: 10},
  {kind: "line", author: "teacher", text: "vařit — to cook", at: 16},
  {kind: "head", text: "Podstatná jména — Nouns", at: 24},
  {kind: "line", author: "teacher", text: "jídlo — food", at: 28},
  {kind: "line", author: "teacher", text: "oběd — lunch", at: 34},
  {kind: "line", author: "teacher", text: "knedlík — dumpling", at: 40},
  {kind: "line", author: "teacher", text: "knedlíky — dumplings", at: 48},
  {kind: "line", author: "teacher", text: "omáčka — sauce", at: 56},
  {kind: "head", text: "Gramatika — Grammar", at: 64},
  {kind: "line", author: "teacher", text: "množné číslo — plural", at: 68},
  {kind: "line", author: "teacher", text: "po kouscích — in pieces", at: 76},
  {kind: "head", text: "Úkol — Today's task", at: 86},
  {
    kind: "line",
    author: "teacher",
    text: "Napiš, co máš rád k obědu. — Write what you like for lunch.",
    at: 90,
  },
  {kind: "head", text: "Fráze — A phrase", at: 108},
  {
    kind: "line",
    author: "you",
    text: "Mám rád knedlík s omáčkou. — I like a dumpling with sauce.",
    at: 112,
  },
  {
    kind: "line",
    author: "teacher",
    text: "Skoro — almost. Knedlíky, ne knedlík.",
    at: 128,
  },
];

/** Marketing lines. Whole sentences, in this order. */
export const LINES = {
  prague: [
    "You live in Prague.",
    "Someone asks you something in Czech, and the answer comes out in English.",
  ],
  notes: [
    "You already have a teacher.",
    "Together you keep a Google Doc of running notes: sentences you tried, exercises from class, the Czech written out with the English beside it.",
    "You add what you managed to say.",
    "You don't revise that doc.",
    "Nothing asks you to produce those sentences again, so you forget the Czech you just learned.",
  ],
  chat: [
    "Paste him that doc.",
    "He reads it, and he writes to you about your Czech, not a textbook's.",
    "He writes first, in Czech.",
    "You answer, even badly.",
    "He corrects the slip, tells you why, and keeps going.",
    "The sentences he brings back are the ones from your notes.",
  ],
  call: [
    "When you want to say them, you call him.",
    "You speak, he answers out loud, and the call stays with the chat.",
  ],
  starts: [
    "He also starts when you had no plan to practice.",
    "One to three Czech conversations a day, from those notes and from topics you picked.",
    "Going over it again means he asks you for the sentence, you try, and he helps you fix it.",
  ],
  level: ["He matches your level, and how hard the correction is."],
} as const;

export const PLACE = "Prague";
export const END_LINE = "Try the sentences from your last class before they go.";
export const FREE_LINE = "Free to start. It takes a minute.";

export const COPY = {
  tryNow: "Say hi to Honza",
  url: "heyhonza.vercel.app",
  honzaOpen: LANDING_DEMO_CONVERSATION[0].text,
  userSlip: food.user,
  honzaFix: food.honzaFix,
  callCaption: "Skoro. Řekni knedlíky s omáčkou.",
  callTitle: cs.call.titleSpeaking,
  callChip: cs.call.chipSpeaking,
  callEnd: cs.call.endCall,
  checkIn: cs.welcome.schedulePreviewMessage,
  notifyMessage: cs.welcome.schedulePreviewMessage,
  notifyApp: cs.welcome.scheduleNotificationAppName,
  notifyTime: cs.welcome.scheduleNotificationTime,
  composerPlaceholder: cs.chat.placeholderOngoing,
  sendLabel: cs.chat.send,
  endLabel: cs.chat.endChat,
} as const;
