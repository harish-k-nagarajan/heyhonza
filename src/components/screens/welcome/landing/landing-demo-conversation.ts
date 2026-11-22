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

/**
 * Absolute placement in the hero cluster (the box around the wide recess).
 * Position only — width lives on `LandingChatBubble`. Inset enough that each
 * line overlaps the well without covering the face.
 */
export const LANDING_HERO_BUBBLE_LAYOUT = [
  "left-0 top-[6%] sm:left-[2%] sm:top-[14%] md:left-[8%] md:top-[18%]",
  "right-0 top-[4%] sm:right-[4%] sm:top-[11%] md:right-[8%] md:top-[16%]",
  "left-0 top-[72%] sm:left-[1%] sm:top-[60%] md:left-[6%] md:top-[60%]",
  "right-0 top-[68%] sm:right-[3%] sm:top-[56%] md:right-[7%] md:top-[56%]",
] as const;
