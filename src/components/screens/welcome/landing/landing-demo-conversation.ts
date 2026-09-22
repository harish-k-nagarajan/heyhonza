/** Single Czech demo thread — hero bubbles and chat-fold messages stay in sync. */
export const LANDING_DEMO_CONVERSATION = [
  {
    role: "honza" as const,
    text: "Ahoj! Dneska o jídle.",
  },
  {
    role: "user" as const,
    text: "Mám rád knedlíky!",
  },
  {
    role: "honza" as const,
    text: "Skoro! S omáčkou to sedí.",
  },
  {
    role: "user" as const,
    text: "Která je nejlepší?",
  },
] as const;

/**
 * Single width authority per demo message — hero orbit, morph ghosts, and chat phone
 * all use the same cap so line breaks never change at handoff or on resize.
 */
export const LANDING_BUBBLE_MAX_BY_INDEX = [
  "max-w-[min(132px,30vw)] md:max-w-[min(200px,38vw)]",
  "max-w-[min(112px,26vw)] md:max-w-[min(168px,34vw)]",
  "max-w-[min(136px,30vw)] md:max-w-[min(208px,38vw)]",
  "max-w-[min(120px,28vw)] md:max-w-[min(176px,36vw)]",
] as const;

/** Absolute placement in the hero orbit. Position only — width lives on `LandingChatBubble`. */
export const LANDING_HERO_BUBBLE_LAYOUT = [
  "left-[4%] top-[12%] md:left-[2%] md:top-[8%]",
  "right-[2%] top-[10%] md:right-[4%] md:top-[6%]",
  "left-[2%] top-[52%] md:left-[1%] md:top-[62%]",
  "right-[2%] top-[48%] md:right-[4%] md:top-[58%]",
] as const;
