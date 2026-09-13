/** Single Czech demo thread — hero bubbles and chat-fold messages stay in sync. */
export const LANDING_DEMO_CONVERSATION = [
  {
    role: "honza" as const,
    text: "Ahoj! Dneska bych si chtěl popovídat o jídle.",
  },
  {
    role: "user" as const,
    text: "Mám rád knedlíky!",
  },
  {
    role: "honza" as const,
    text: "Skoro! Správně: Mám rád knedlíky s omáčkou.",
  },
  {
    role: "user" as const,
    text: "A jaká omáčka je nejlepší?",
  },
] as const;

/**
 * Single width authority per demo message — hero orbit, morph ghosts, and chat phone
 * all use the same cap so line breaks never change at handoff or on resize.
 */
export const LANDING_BUBBLE_MAX_BY_INDEX = [
  "max-w-[min(240px,42vw)]",
  "max-w-[min(200px,38vw)]",
  "max-w-[min(250px,44vw)]",
  "max-w-[min(210px,40vw)]",
] as const;

/** Absolute placement in the hero orbit (md+). Position only — width lives on `LandingChatBubble`. */
export const LANDING_HERO_BUBBLE_LAYOUT = [
  "left-[2%] top-[8%]",
  "right-[2%] top-[6%]",
  "left-[0%] top-[62%]",
  "right-[0%] top-[58%]",
] as const;
