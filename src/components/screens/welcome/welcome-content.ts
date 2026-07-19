import type { LevelId, TopicId } from "@/lib/constants";
import { LEVEL_OPTIONS, TOPIC_OPTIONS } from "@/lib/constants";

/**
 * Marketing copy for the Welcome front door "how it works" steps.
 *
 * Classic keeps its shipped English (`WELCOME_STEPS`) byte-for-byte. Hmat in-app
 * chrome uses `WELCOME_STEPS_CS`. The **landing page** uses English for all
 * product explanation and Czech only inside showcase samples (demo chat, topic
 * lines) — learners may not read Czech yet.
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

/** First-visit hero — English product copy for Czech learners. */
export const LANDING_HERO_FIRST = {
  kicker: "Hi, I'm Honza",
  headline: "Learn Czech by\ntexting a friend",
  subcopy:
    "Not a streak. Not a leaderboard. Open the app — Honza is already writing to you in Czech. You reply. He gently fixes your mistakes.",
  cta: "Start learning Czech",
  ctaHint: "Free · takes a minute",
} as const;

/** Shown right after sign-out — warm send-off, nudge to come back. */
export const LANDING_HERO_SIGNED_OUT = {
  kicker: "See you soon!",
  headline: "Honza will be\nhere when you are",
  subcopy:
    "Your progress is saved. Whenever you're ready for another Czech chat, sign back in — I'll pick up where we left off.",
  cta: "Sign back in",
  ctaHint: "Same account · one tap",
} as const;

/** Return-visitor hero lines — warm English nudge to sign up. */
export const LANDING_HERO_RETURN = [
  {
    kicker: "Back again?",
    headline: "Honza already has\na message ready",
    subcopy:
      "You left before we got to chat last time. Sign up — your first Czech conversation is waiting right after.",
  },
  {
    kicker: "Welcome back",
    headline: "Czech is still\nwaiting for you",
    subcopy:
      "Honza remembers you were here. Registration takes a minute — then you just write back in Czech.",
  },
  {
    kicker: "Hey, you again!",
    headline: "So — ready\nto write back?",
    subcopy:
      "You need an account to chat — but I promise the first message is waiting the moment you sign in.",
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

/** English level blurbs — labels come from LEVEL_OPTIONS. */
export const LEVEL_LANDING_BLURBS: Record<LevelId, string> = {
  A1: "Short sentences, lots of patience, zero stress.",
  A2: "You know a little — Honza pushes you forward without a textbook.",
  B1: "Longer replies, gentler corrections, real topics.",
  B2: "Almost fluent — but you still learn from your mistakes.",
};

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

/** Ordered topic ids for the landing strip (same set as TOPIC_OPTIONS). */
export const LANDING_TOPIC_IDS = TOPIC_OPTIONS.map((t) => t.id);

/** Ordered level ids for the landing ladder (same set as LEVEL_OPTIONS). */
export const LANDING_LEVEL_IDS = LEVEL_OPTIONS.map((l) => l.id);

export const LANDING_SECTIONS = {
  demo: {
    num: "01",
    title: "What it looks like",
    lead: "Honza writes first. You reply in Czech. He corrects — and keeps going.",
  },
  topics: {
    num: "02",
    title: "What you'll talk about",
    lead: "Pick your topics at sign-up — real Czech about things you care about, not textbook phrases.",
  },
  levels: {
    num: "03",
    title: "Meets you at your level",
    lead: "From your first sentences to almost-fluent conversation.",
  },
  steps: {
    num: "04",
    title: "How it works",
    lead: "Three steps. No streaks. Just a chat with Honza.",
  },
} as const;

export const LANDING_PWA_HINT =
  "Add Honza to your home screen and he lives on your phone like any other app. A message is waiting when you open it — not a push notification.";

export const LANDING_STORAGE_KEY = "honza-landing-seen";
export const LANDING_VISIT_COUNT_KEY = "honza-landing-visits";
