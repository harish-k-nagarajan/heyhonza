/**
 * Marketing copy for the Welcome front door "how it works" steps.
 *
 * Classic keeps its shipped English (`WELCOME_STEPS`) byte-for-byte. Hmat leads
 * with the character in full Czech, so it gets its own translated set
 * (`WELCOME_STEPS_CS`) — same three beats, learner-facing Czech with full
 * diacritics.
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

/** Czech version of the steps for the Hmat front door. */
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
