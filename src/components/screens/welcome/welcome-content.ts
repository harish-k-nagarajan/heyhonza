import type { LevelId, TopicId } from "@/lib/constants";
import { LEVEL_OPTIONS, TOPIC_OPTIONS } from "@/lib/constants";
import {
  LANDING_DEMO_CONVERSATION,
  LANDING_HERO_BUBBLE_LAYOUT,
} from "@/components/screens/welcome/landing/landing-demo-conversation";

/**
 * Marketing copy for the Welcome front door.
 * English for product explanation; Czech only inside showcase samples.
 */
export const WELCOME_STEPS = [
  {
    n: "01",
    title: "Honza starts",
    body: "Open the app and a message is already waiting — in Czech, about something you actually care about.",
  },
  {
    n: "02",
    title: "You reply in Czech",
    body: "Type it back. Badly is fine. Getting it wrong is the part where the learning happens.",
  },
  {
    n: "03",
    title: "He fixes it, kindly",
    body: "Honza corrects the slip, tells you why, and keeps the conversation going.",
  },
] as const;

/** Czech version of the steps — used by Hmat in-app surfaces, not the landing. */
export const WELCOME_STEPS_CS = [
  {
    n: "01",
    title: "Honza začíná",
    body: "Otevřeš appku a zpráva už na tebe čeká — česky a o něčem, co tě fakt zajímá.",
  },
  {
    n: "02",
    title: "Odepíšeš česky",
    body: "Napiš to zpátky. Klidně blbě. Právě v těch chybách se to naučíš.",
  },
  {
    n: "03",
    title: "Laskavě to opraví",
    body: "Honza chybu opraví, vysvětlí proč, a povídá si s tebou dál.",
  },
] as const;

/** Czech sample lines per topic — in-app showcase only (maps to TOPIC_OPTIONS ids). */
export const TOPIC_LANDING_SAMPLES: Record<TopicId, string> = {
  daily: '„Jaký byl tvůj víkend? Co jsi dělal včera večer?"',
  travel: '„Kde jsi byl naposledy? Co se ti tam líbilo nejvíc?"',
  food: '„Co dnes vaříš? Máš radši knedlíky nebo brambory?"',
  work: '„Jaký máš dnes program v kanceláři?"',
  grammar: '„Zkus mi říct větu v minulém čase — klidně blbě."',
  smalltalk: '„Jaké je dnes počasí u tebe? Co plánuješ na večer?"',
};

/** Ordered topic ids for legacy landing strip (same set as TOPIC_OPTIONS). */
export const LANDING_TOPIC_IDS = TOPIC_OPTIONS.map((t) => t.id);

/** Demo chat beats — Czech showcase of what the app feels like. */
export const DEMO_CHAT_BEATS = [
  {
    honza: "Ahoj! Dneska bych si chtěl popovídat o jídle. Co máš nejradši k obědu?",
    user: "Mám rád knedlíky s omáčkou.",
    honzaFix: 'Skoro! Správně: „Mám rád knedlíky s omáčkou." — výborně, pokračuj!',
  },
  {
    honza: "Super! A co piješ k obědu — vodu, nebo radši kávu?",
    user: "Piju kávu vždycky.",
    honzaFix: '„Piju kávu vždycky" je v pořádku. Zkus příště: „Vždycky piju kávu."',
  },
] as const;

export const LANDING_PWA_HINT =
  "Add Honza to your home screen and he lives on your phone like any other app. A message is waiting when you open it — not a push notification.";

export const LANDING_HERO_FIRST = {
  headline: "Learn Czech by texting a friend",
  subcopy:
    "Not a streak. Not a leaderboard. Open the app. Honza is already writing to you in Czech.",
  cta: "Say hi to Honza",
  ctaHint: "Free · takes a minute",
} as const;

/** Shown right after sign-out — warm send-off, nudge to come back. */
export const LANDING_HERO_SIGNED_OUT = {
  headline: "Honza will be here when you are.",
  subcopy:
    "Your progress is saved. Whenever you're ready for another Czech chat, sign back in — I'll pick up where we left off.",
  cta: "Sign back in",
  ctaHint: "Same account · one tap",
} as const;

/** Return-visitor hero lines — warm English nudge to sign up. */
export const LANDING_HERO_RETURN = [
  {
    headline: "Honza already has a message ready.",
    subcopy:
      "You left before we got to chat last time. Sign up — your first Czech conversation is waiting right after.",
  },
  {
    headline: "Czech is still waiting for you.",
    subcopy:
      "Honza remembers you were here. Registration takes a minute — then you just write back in Czech.",
  },
  {
    headline: "So — ready to write back?",
    subcopy:
      "You need an account to chat — but I promise the first message is waiting the moment you sign in.",
  },
] as const;

/** Floating bubbles in the hero orbit (Fold 01) — same thread as the chat fold. */
export const LANDING_HERO_BUBBLES = LANDING_DEMO_CONVERSATION.map((message, index) => ({
  ...message,
  className: LANDING_HERO_BUBBLE_LAYOUT[index] ?? LANDING_HERO_BUBBLE_LAYOUT[0],
}));

/** Phone chat preview (Fold 02). */
export const LANDING_PHONE_CHAT = LANDING_DEMO_CONVERSATION;

/** Call practice preview (Fold 03). */
export const LANDING_CALL = {
  prompt: "Zkus mi říct, co jsi dělal o víkendu.",
  transcript:
    "O víkendu jsem šel na procházku a potom jsem vařil knedlíky...",
} as const;

/** Honza question chips — topics ticker row 1. */
export const LANDING_TOPIC_QUESTIONS = [
  "Jaký byl tvůj víkend?",
  "Co dnes vaříš?",
  "Kde jsi byl naposledy?",
  "Jaké je dnes počasí?",
  "Zkus větu v minulém čase.",
  "Co plánuješ na večer?",
  "Jaký máš program v práci?",
] as const;

/** User answer chips — topics ticker row 2. */
export const LANDING_TOPIC_ANSWERS = [
  "Mám rád knedlíky s omáčkou.",
  "Byl jsem v Praze.",
  "Dnes vařím brambory.",
  "U mě prší, ale je teplo.",
  "Včera jsem šel do kina.",
  "Pracuju z domova dnes.",
  "Večer jdu na pivo.",
] as const;

/** English level blurbs — labels come from LEVEL_OPTIONS. */
export const LEVEL_LANDING_BLURBS: Record<LevelId, string> = {
  A1: "Short sentences, zero stress",
  A2: "Honza pushes you further",
  B1: "Real topics, gentle fixes",
  B2: "Almost fluent — still learning",
};

export const LANDING_LEVEL_IDS = LEVEL_OPTIONS.map((l) => l.id);

export const LANDING_SECTIONS = {
  chat: {
    kicker: "WHAT IT LOOKS LIKE",
    title: "Honza writes first",
    titleLine2: "You reply in Czech",
    lead: "He corrects gently and keeps the conversation going — no textbook drills, just real chat",
  },
  call: {
    kicker: "PRACTICE SPEAKING",
    title: "When you're ready, just call him",
    lead: "Same Honza, same patience — practice speaking out loud, he listens, corrects, and keeps talking",
  },
  schedule: {
    kicker: "DAILY CHECK-INS",
    title: "Pick when Honza writes",
    lead: "One to three Czech messages a day — set exact times or let Honza surprise you when it feels natural",
  },
  topics: {
    kicker: "TOPICS",
    title: "What you'll talk about",
    lead: "Real Czech about things you care about — pick topics, then hear them in conversation",
  },
  levels: {
    kicker: "LEVELS",
    title: "Meets you at your level",
    lead: "From your first sentences to almost-fluent conversation",
  },
} as const;

export const LANDING_FOOTER = {
  headline: "Ready to say ahoj?",
  note: "Free to start. Takes a minute. Add Honza to your home screen and he lives on your phone.",
} as const;

export const LANDING_STORAGE_KEY = "honza-landing-seen";
export const LANDING_VISIT_COUNT_KEY = "honza-landing-visits";
