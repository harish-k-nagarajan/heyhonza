import {LANDING_DEMO_CONVERSATION} from "@/components/screens/welcome/landing/landing-demo-conversation";
import {DEMO_CHAT_BEATS, LANDING_HERO_FIRST} from "@/components/screens/welcome/welcome-content";
import {getStrings} from "@/lib/i18n/locales";

const cs = getStrings("cs");
const food = DEMO_CHAT_BEATS[0];

export const TEACHER = "#1F6B4A";
export const YOU = "#B4532A";
export const GLOSS = "#8A8178";
export const INK = "#243D2C";
export const CORAL = "#E8432D";

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

export const KNEDLIKY_MARK = "Knedlíky, ne knedlík.";

/** SCRIPT v8 (final) — exact on-screen English per approval list. */
export const LINES = {
  prague: [
    "You live in Prague. Or you are trying to.",
    "The food is good. The city is beautiful. You are building a life here on purpose.",
    "Speaking Czech in daily life is still the hard part. Not the homework. The moment someone needs a real answer from you.",
    "You take lessons. You mean it. You want to belong at work, at the table, and in everyday conversation.",
    "Your colleague asks about your weekend. A waiter waits for your order. Someone asks which tram goes to Anděl. You understood. You even rehearsed.",
    "You still answer in English. Or you go quiet. Right when Czech is what they need.",
  ],
  intro: [
    "You do not need another app that drills random words while a waiter is standing in front of you.",
    "Introducing Honza.",
    "He is the Czech you practice with after class. On your phone. In a thread that feels like a person, not a quiz.",
    "He writes first. He works from the same notes your teacher already gave you. Your phrases. Your corrections.",
    "Think tutor, friend, or the one who keeps knedlíky from sliding back to knedlík.",
  ],
  notes: [
    "Link the Google Doc you share with your teacher, or upload your lesson notes. Honza reads them.",
    "Those notes are your source of truth. He knows what you covered. The verbs, the phrases, the correction you almost had.",
    "When he messages you, he starts from that material. Same lesson. Fresh practice.",
  ],
  chat: [
    "He writes first. You type back in Czech. He fixes the slip and keeps the chat going.",
  ],
  call: [
    "Call Honza. Talk out loud like a real call. A few minutes of Czech with your voice. He hears you, corrects you on the spot, and you drill what is already in your notes.",
    "You already paid for that Czech in class. Honza helps you keep it alive during the week. You remember more. You speak with more nerve. You walk into the next lesson ready to go further.",
  ],
  notify: [
    "Turn on daily notifications. Honza can message you when you want, on the days you forget to open the app.",
    "He says hi. He starts a small conversation. He helps you pick up where you left off.",
    "The goal is steady progress. Get better at the Czech you already know. Build on it. Stay curious for what comes next.",
  ],
  close: ["Say hi to Honza · heyhonza.vercel.app"],
} as const;

export const END_LINE = LINES.notify[2];
export const CTA_LINE = LANDING_HERO_FIRST.cta;

export const COPY = {
  url: "heyhonza.vercel.app",
  honzaOpen: LANDING_DEMO_CONVERSATION[0].text,
  userSlip: food.user,
  honzaFix: food.honzaFix,
  callCaption: "Skoro. Řekni knedlíky s omáčkou.",
  callTitle: cs.call.titleSpeaking,
  callChip: cs.call.chipSpeaking,
  callTitleListening: cs.call.titleListening,
  callChipListening: cs.call.chipListening,
  callEnd: cs.call.endCall,
  checkIn: cs.welcome.schedulePreviewMessage,
  notifyMessage: cs.welcome.schedulePreviewMessage,
  notifyApp: cs.welcome.scheduleNotificationAppName,
  notifyTime: cs.welcome.scheduleNotificationTime,
  composerPlaceholder: cs.chat.placeholderOngoing,
  sendLabel: cs.chat.send,
  endLabel: cs.chat.endChat,
} as const;