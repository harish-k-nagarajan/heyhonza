export type UiLocale = "cs" | "en";

export const DEFAULT_LOCALE: UiLocale = "en";

export type SignInCopy = {
  title: string;
  heading: string;
  subtitle: string;
  notConfiguredLabel: string;
  confirmLabel: string;
  confirmLead: string;
  confirmTail: string;
  backToSignin: string;
  emailPlaceholder: string;
  passwordPlaceholder: string;
  emailAria: string;
  passwordAria: string;
  creating: string;
  signingIn: string;
  createAccount: string;
  signIn: string;
  toggleToSignup: string;
  toggleToSignin: string;
  invalidEmail: string;
  passwordTooShort: string;
  linkInvalid: string;
  notConfigured: string;
  badCredentials: string;
  emailNotConfirmed: string;
  alreadyRegistered: string;
  rateLimited: string;
};

export type NavCopy = {
  chat: string;
  call: string;
  settings: string;
};

export type ChatCopy = {
  startChat: string;
  send: string;
  endChat: string;
  history: string;
  historyTitle: string;
  emptyHint: string;
  thinking: string;
  tryAgain: string;
  noHistory: string;
  messageCount: (n: number) => string;
  backToChat: string;
  transcript: string;
};

export type SettingsCopy = {
  appLanguage: string;
  languageCs: string;
  languageEn: string;
};

export type LocaleStrings = {
  signin: SignInCopy;
  nav: NavCopy;
  chat: ChatCopy;
  settings: SettingsCopy;
};

const MIN_PASSWORD = 6;

const en: LocaleStrings = {
  signin: {
    title: "// SIGN IN",
    heading: "Ahoj! I'm Honza.",
    subtitle: "Sign in and we'll pick up your Czech where you left off.",
    notConfiguredLabel: "// NOT CONFIGURED",
    confirmLabel: "// CONFIRM YOUR EMAIL",
    confirmLead: "Click the link I sent to",
    confirmTail: "then come back and sign in.",
    backToSignin: "Back to sign in",
    emailPlaceholder: "you@email.com",
    passwordPlaceholder: "password",
    emailAria: "Email",
    passwordAria: "Password",
    creating: "Creating…",
    signingIn: "Signing in…",
    createAccount: "Create account",
    signIn: "Sign in",
    toggleToSignup: "New here? Create an account",
    toggleToSignin: "Already have an account? Sign in",
    invalidEmail: "Enter a valid email address.",
    passwordTooShort: `Password needs at least ${MIN_PASSWORD} characters.`,
    linkInvalid:
      "That confirmation link expired or was already used. Sign in below, or create the account again to get a fresh one.",
    notConfigured: "Sign-in isn't configured yet on this deploy.",
    badCredentials: "That email and password don't match. Try again, or create an account.",
    emailNotConfirmed: "Confirm your email first — check your inbox for the link.",
    alreadyRegistered: "That email already has an account. Sign in instead.",
    rateLimited: "Too many attempts for now. Wait a minute and try again.",
  },
  nav: {
    chat: "Chat",
    call: "Call",
    settings: "Settings",
  },
  chat: {
    startChat: "Start chat",
    send: "Send",
    endChat: "End chat",
    history: "Chat history",
    historyTitle: "Previous chats",
    emptyHint: "Honza will open the conversation in Czech. Tap Start chat when you're ready.",
    thinking: "Thinking…",
    tryAgain: "Try again",
    noHistory: "No ended chats yet.",
    messageCount: (n) => `${n} message${n === 1 ? "" : "s"}`,
    backToChat: "Back to chat",
    transcript: "Chat transcript",
  },
  settings: {
    appLanguage: "App language",
    languageCs: "Čeština",
    languageEn: "English",
  },
};

const cs: LocaleStrings = {
  signin: {
    title: "Přihlášení",
    heading: "Ahoj! Já jsem Honza.",
    subtitle: "Přihlas se a navážeme s češtinou tam, kde jsi skončil.",
    notConfiguredLabel: "// NENÍ NASTAVENO",
    confirmLabel: "// POTVRĎ SVŮJ E-MAIL",
    confirmLead: "Klikni na odkaz, který jsem poslal na",
    confirmTail: "pak se vrať a přihlas se.",
    backToSignin: "Zpět na přihlášení",
    emailPlaceholder: "ty@email.cz",
    passwordPlaceholder: "heslo",
    emailAria: "E-mail",
    passwordAria: "Heslo",
    creating: "Vytvářím…",
    signingIn: "Přihlašuji…",
    createAccount: "Vytvořit účet",
    signIn: "Přihlásit se",
    toggleToSignup: "Nemáš účet? Vytvoř si ho",
    toggleToSignin: "Už účet máš? Přihlas se",
    invalidEmail: "Zadej platnou e-mailovou adresu.",
    passwordTooShort: `Heslo musí mít aspoň ${MIN_PASSWORD} znaků.`,
    linkInvalid:
      "Ten potvrzovací odkaz vypršel nebo už byl použitý. Přihlas se níže, nebo si účet vytvoř znovu a přijde nový.",
    notConfigured: "Přihlášení zatím na tomto nasazení není nastavené.",
    badCredentials: "E-mail a heslo nesedí. Zkus to znovu, nebo si vytvoř účet.",
    emailNotConfirmed:
      "Nejdřív potvrď svůj e-mail — zkontroluj schránku a klikni na odkaz.",
    alreadyRegistered: "Tenhle e-mail už účet má. Přihlas se.",
    rateLimited: "Zatím moc pokusů. Počkej chvíli a zkus to znovu.",
  },
  nav: {
    chat: "Chat",
    call: "Hovor",
    settings: "Nastavení",
  },
  chat: {
    startChat: "Začít chat",
    send: "Odeslat",
    endChat: "Ukončit chat",
    history: "Historie chatů",
    historyTitle: "Předchozí chaty",
    emptyHint:
      "Honza začne konverzaci česky. Až budeš připravený, klepni na Začít chat.",
    thinking: "Přemýšlí…",
    tryAgain: "Zkusit znovu",
    noHistory: "Zatím žádné ukončené chaty.",
    messageCount: (n) => {
      if (n === 1) return "1 zpráva";
      if (n >= 2 && n <= 4) return `${n} zprávy`;
      return `${n} zpráv`;
    },
    backToChat: "Zpět na chat",
    transcript: "Přepis chatu",
  },
  settings: {
    appLanguage: "Jazyk aplikace",
    languageCs: "Čeština",
    languageEn: "English",
  },
};

export const STRINGS: Record<UiLocale, LocaleStrings> = { en, cs };

export function getStrings(locale: UiLocale): LocaleStrings {
  return STRINGS[locale] ?? STRINGS.en;
}
