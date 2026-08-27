import type { ExtendedCopy } from "@/lib/i18n/extended";
import { EXTENDED } from "@/lib/i18n/extended";

export type UiLocale = "cs" | "en";

export const DEFAULT_LOCALE: UiLocale = "cs";

export type AuthFormCopy = {
  kicker: string;
  heading: string;
  subtitle: string;
  emailPlaceholder: string;
  passwordPlaceholder: string;
  cta: string;
};

export type AuthSignupCopy = AuthFormCopy & {
  namePlaceholder: string;
  switchPrompt: string;
  switchLink: string;
};

export type AuthLoginCopy = AuthFormCopy & {
  secondaryCta: string;
};

export type SignInCopy = {
  title: string;
  heading: string;
  subtitle: string;
  login: AuthLoginCopy;
  signup: AuthSignupCopy;
  enterName: string;
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
  replyInCzech: string;
  placeholderIdle: string;
  placeholderOngoing: string;
  titlePresent: string;
  chipProblem: string;
  chipThinking: string;
  chipInChat: string;
  chipPresent: string;
  openerKicker: string;
};

export type LevelHintCopy = {
  A1: string;
  A2: string;
  B1: string;
  B2: string;
};

export type SettingsCopy = {
  appLanguage: string;
  languageCs: string;
  languageEn: string;
  loading: string;
  kicker: string;
  title: string;
  subtitle: string;
  accountTitle: string;
  accountEmailFallback: string;
  accountPageKicker: string;
  accountPageTitle: string;
  accountNameLabel: string;
  accountEmailLabel: string;
  accountCurrentPassword: string;
  accountNewPassword: string;
  accountSaveName: string;
  accountSaveEmail: string;
  accountSavePassword: string;
  accountEmailConfirm: string;
  accountSaved: string;
  accountNeedAuth: string;
  accountBack: string;
  sections: {
    notifications: string;
    schedule: string;
    appLanguage: string;
    aiText: string;
    aiVoice: string;
    level: string;
    topics: string;
    formality: string;
    context: string;
    deviceData: string;
  };
  pushTitle: string;
  pushSubtitle: string;
  scheduleTitle: string;
  scheduleSubtitle: (count: number) => string;
  scheduleHowOften: string;
  scheduleWhen: string;
  scheduleSpecificTime: string;
  scheduleRandom: string;
  scheduleFirstMessage: string;
  scheduleFirstMessageAria: string;
  scheduleHint: string;
  appLanguageHint: string;
  aiTextHint: string;
  aiVoiceHint: string;
  openRouterName: string;
  openRouterDesc: string;
  elevenLabsName: string;
  elevenLabsDesc: string;
  connected: string;
  disconnected: string;
  serverKey: string;
  yourKey: string;
  addApiKey: string;
  apiKeyAdded: string;
  pasteApiKey: string;
  saveKey: string;
  disconnect: string;
  modelLabel: string;
  modelsLoading: string;
  formalityHint: string;
  formalityTy: string;
  formalityVy: string;
  contextHint: string;
  instructionsLabel: string;
  activeSources: string;
  connectGoogleDoc: string;
  googleDocConnected: string;
  googleDocFailed: string;
  fileUploadHint: string;
  resetChat: string;
  notificationsHint: string;
  notificationsOn: string;
  notificationsOff: string;
  notificationsDenied: string;
  notificationsReady: string;
  notificationsTurnedOff: string;
  notificationsEnableFailed: string;
  serverStatus: string;
  serverChecking: string;
  serverConfigured: string;
  serverMissing: string;
  levelHint: string;
  levelHints: LevelHintCopy;
  topicsHint: string;
  contextSynced: (date: string, count: number) => string;
  contextEmpty: string;
  googleDocLabel: string;
  googleDocPlaceholder: string;
  googleDocAria: string;
  fetching: string;
  addFromGoogleDocs: string;
  pastedText: string;
  pastedTextAria: string;
  pastePlaceholder: string;
  addText: string;
  updateText: string;
  textLoaded: string;
  fileLabel: string;
  googleDocKind: string;
  remove: string;
  resetData: string;
  signOut: string;
};

export type LocaleStrings = {
  signin: SignInCopy;
  nav: NavCopy;
  chat: ChatCopy;
  settings: SettingsCopy;
} & ExtendedCopy;

const MIN_PASSWORD = 6;

const en: LocaleStrings = {
  signin: {
    title: "// SIGN IN",
    heading: "Ahoj! I'm Honza.",
    subtitle: "Sign in and we'll pick up your Czech where you left off.",
    login: {
      kicker: "WELCOME BACK",
      heading: "Log in",
      subtitle: "Pick up where you left off with Honza.",
      emailPlaceholder: "Email",
      passwordPlaceholder: "Password",
      cta: "Log in",
      secondaryCta: "Say hi to Honza — sign up",
    },
    signup: {
      kicker: "NEW HERE",
      heading: "Say hi to Honza",
      subtitle: "Create your account and Honza will start writing to you in Czech.",
      namePlaceholder: "Your name",
      emailPlaceholder: "Email",
      passwordPlaceholder: "Password",
      cta: "Say hi to Honza",
      switchPrompt: "Already have an account?",
      switchLink: "Log in",
    },
    enterName: "Enter your name.",
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
    startChat: "Start chatting",
    send: "Send",
    endChat: "End chat",
    history: "Chat history",
    historyTitle: "Previous chats",
    emptyHint: "Send Honza a message to start chatting.",
    thinking: "Thinking…",
    tryAgain: "Try again",
    noHistory: "No ended chats yet.",
    messageCount: (n) => `${n} message${n === 1 ? "" : "s"}`,
    backToChat: "Back to chat",
    transcript: "Chat transcript",
    replyInCzech: "Reply in Czech",
    placeholderIdle: "Write to Honza…",
    placeholderOngoing: "Write a message…",
    titlePresent: "Honza is here",
    chipProblem: "problem",
    chipThinking: "thinking",
    chipInChat: "in chat",
    chipPresent: "present",
    openerKicker: "// HONZA WROTE",
  },
  settings: {
    appLanguage: "App language",
    languageCs: "Čeština",
    languageEn: "English",
    loading: "Loading…",
    kicker: "SETTINGS",
    title: "How Honza talks to you",
    subtitle: "Change your level, your topics, and what Honza knows about you.",
    accountTitle: "Your account",
    accountEmailFallback: "you@email.com",
    accountPageKicker: "ACCOUNT",
    accountPageTitle: "Name, email, password",
    accountNameLabel: "What Honza should call you",
    accountEmailLabel: "Email",
    accountCurrentPassword: "Current password",
    accountNewPassword: "New password",
    accountSaveName: "Save name",
    accountSaveEmail: "Update email",
    accountSavePassword: "Update password",
    accountEmailConfirm: "Check your inbox to confirm the new email.",
    accountSaved: "Saved.",
    accountNeedAuth: "Sign in to change email and password.",
    accountBack: "Back to settings",
    sections: {
      notifications: "NOTIFICATIONS",
      schedule: "DAILY CHECK-INS",
      appLanguage: "APP LANGUAGE",
      aiText: "CHAT REPLIES",
      aiVoice: "VOICE ON CALLS",
      level: "LEARNING LEVEL",
      topics: "TOPICS",
      formality: "ADDRESSING",
      context: "MORE CONTEXT",
      deviceData: "DATA & ACCOUNT",
    },
    pushTitle: "Push notifications",
    pushSubtitle: "Honza will nudge you when he has a tip",
    scheduleTitle: "Daily check-ins",
    scheduleSubtitle: (count) => `Honza writes first, ${count}× a day`,
    scheduleHowOften: "How many per day",
    scheduleWhen: "When",
    scheduleSpecificTime: "Specific time",
    scheduleRandom: "Random",
    scheduleFirstMessage: "First message",
    scheduleFirstMessageAria: "First message time",
    scheduleHint: "Asks for notifications. On iPhone, add Honza to the Home Screen first.",
    appLanguageHint: "Which language should the app use?",
    aiTextHint: "Paste an OpenRouter key so Honza can reply in chat.",
    aiVoiceHint: "Paste an ElevenLabs key so Honza can speak on calls.",
    openRouterName: "OpenRouter",
    openRouterDesc: "Chat replies",
    elevenLabsName: "ElevenLabs",
    elevenLabsDesc: "Spoken replies on calls",
    connected: "Connected",
    disconnected: "Not connected",
    serverKey: "Server key",
    yourKey: "Your key",
    addApiKey: "Add an API key",
    apiKeyAdded: "API key added",
    pasteApiKey: "Paste API key",
    saveKey: "Save",
    disconnect: "Remove key",
    modelLabel: "Model",
    modelsLoading: "Loading models…",
    formalityHint: "Should Honza use informal or formal address?",
    formalityTy: "Ty",
    formalityVy: "Vy",
    contextHint:
      "Write instructions, attach a Google Doc, or upload a .md file — Honza reads from these.",
    instructionsLabel: "Your instructions",
    activeSources: "Active sources",
    connectGoogleDoc: "Connect",
    googleDocConnected: "Connected",
    googleDocFailed: "Couldn’t load — check the link",
    fileUploadHint: "Tap to choose a file",
    resetChat: "Reset chat",
    notificationsHint:
      "Get notified when Honza is ready to write first — foundation only until scheduling ships.",
    notificationsOn: "Turn on",
    notificationsOff: "Turn off",
    notificationsDenied: "Allow notifications in browser settings.",
    notificationsReady: "Ready — when scheduling ships, Honza can reach you.",
    notificationsTurnedOff: "Notifications turned off.",
    notificationsEnableFailed: "Could not enable notifications.",
    serverStatus: "Server status",
    serverChecking: "…",
    serverConfigured: "configured",
    serverMissing: "missing OPENROUTER_API_KEY",
    levelHint: "Honza adjusts pace, vocabulary, and difficulty.",
    levelHints: { A1: "Start", A2: "Basics", B1: "Next", B2: "Advanced" },
    topicsHint: "Pick topics you want to talk about with Honza.",
    contextSynced: (date, count) =>
      `Last synced ${date} · ${count} source${count === 1 ? "" : "s"} Honza reads from.`,
    contextEmpty:
      "No context yet. Add a Google Doc, file, or paste to teach Honza what you're learning.",
    googleDocLabel: "Google Doc (public link)",
    googleDocPlaceholder: "https://docs.google.com/document/d/…",
    googleDocAria: "Google Doc URL",
    fetching: "Fetching…",
    addFromGoogleDocs: "Add from Google Docs",
    pastedText: "Pasted text",
    pastedTextAria: "Pasted text",
    pastePlaceholder: "…or paste text",
    addText: "Add text",
    updateText: "Update text",
    textLoaded: "Loaded in context",
    fileLabel: "File (.txt, .md)",
    googleDocKind: "Google Doc",
    remove: "Remove",
    resetData: "Delete data and run onboarding again",
    signOut: "Sign out",
  },
  ...EXTENDED.en,
};

const cs: LocaleStrings = {
  signin: {
    title: "Přihlášení",
    heading: "Ahoj! Já jsem Honza.",
    subtitle: "Přihlas se a navážeme s češtinou tam, kde jsi skončil.",
    login: {
      kicker: "VÍTEJ ZPĚT",
      heading: "Přihlášení",
      subtitle: "Navážeme tam, kde jsi s Honzou skončil.",
      emailPlaceholder: "E-mail",
      passwordPlaceholder: "Heslo",
      cta: "Přihlásit se",
      secondaryCta: "Pozdrav Honzu — vytvoř účet",
    },
    signup: {
      kicker: "JSEM TU NOVÝ",
      heading: "Pozdrav Honzu",
      subtitle: "Vytvoř si účet a Honza ti začne psát česky.",
      namePlaceholder: "Tvé jméno",
      emailPlaceholder: "E-mail",
      passwordPlaceholder: "Heslo",
      cta: "Pozdrav Honzu",
      switchPrompt: "Už účet máš?",
      switchLink: "Přihlas se",
    },
    enterName: "Zadej své jméno.",
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
    startChat: "Začít chatovat",
    send: "Odeslat",
    endChat: "Ukončit",
    history: "Historie chatů",
    historyTitle: "Předchozí chaty",
    emptyHint: "Napiš Honzovi zprávu a začni chatovat.",
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
    replyInCzech: "Odpověz česky",
    placeholderIdle: "Napiš Honzovi…",
    placeholderOngoing: "Napiš zprávu…",
    titlePresent: "Honza je tu",
    chipProblem: "problém",
    chipThinking: "přemýšlí",
    chipInChat: "v chatu",
    chipPresent: "přítomný",
    openerKicker: "// HONZA NAPSAL",
  },
  settings: {
    appLanguage: "Jazyk aplikace",
    languageCs: "Čeština",
    languageEn: "English",
    loading: "Načítání…",
    kicker: "NASTAVENÍ",
    title: "Jak s tebou Honza mluví",
    subtitle: "Změň úroveň, témata a to, co o tobě Honza ví.",
    accountTitle: "Tvůj účet",
    accountEmailFallback: "ahoj@honza.app",
    accountPageKicker: "ÚČET",
    accountPageTitle: "Jméno, e-mail, heslo",
    accountNameLabel: "Jak ti má Honza říkat",
    accountEmailLabel: "E-mail",
    accountCurrentPassword: "Současné heslo",
    accountNewPassword: "Nové heslo",
    accountSaveName: "Uložit jméno",
    accountSaveEmail: "Změnit e-mail",
    accountSavePassword: "Změnit heslo",
    accountEmailConfirm: "Potvrď nový e-mail v schránce.",
    accountSaved: "Uloženo.",
    accountNeedAuth: "Pro změnu e-mailu a hesla se přihlas.",
    accountBack: "Zpět do nastavení",
    sections: {
      notifications: "OZNÁMENÍ",
      schedule: "DENNÍ CHECK-INY",
      appLanguage: "JAZYK APLIKACE",
      aiText: "ODPOVĚDI V CHATU",
      aiVoice: "HLAS V HOVORECH",
      level: "ÚROVEŇ UČENÍ",
      topics: "TÉMATA",
      formality: "OSLOVENÍ",
      context: "DALŠÍ KONTEXT",
      deviceData: "DATA & ÚČET",
    },
    pushTitle: "Push upozornění",
    pushSubtitle: "Honza ti napíše, když má tip",
    scheduleTitle: "Denní check-iny",
    scheduleSubtitle: (count) => `Honza napíše první, ${count}× denně`,
    scheduleHowOften: "Kolikrát denně",
    scheduleWhen: "Kdy",
    scheduleSpecificTime: "Konkrétní čas",
    scheduleRandom: "Náhodně",
    scheduleFirstMessage: "První zpráva",
    scheduleFirstMessageAria: "Čas první zprávy",
    scheduleHint: "Požádá o oznámení. Na iPhonu nejdřív přidej Honzu na plochu.",
    appLanguageHint: "V jakém jazyce chceš rozhraní?",
    aiTextHint: "Vlož OpenRouter klíč, ať ti Honza odpovídá v chatu.",
    aiVoiceHint: "Vlož ElevenLabs klíč, ať Honza mluví v hovorech.",
    openRouterName: "OpenRouter",
    openRouterDesc: "Odpovědi v chatu",
    elevenLabsName: "ElevenLabs",
    elevenLabsDesc: "Mluvené odpovědi v hovorech",
    connected: "Připojeno",
    disconnected: "Nepřipojeno",
    serverKey: "Serverový klíč",
    yourKey: "Tvůj klíč",
    addApiKey: "Přidat API klíč",
    apiKeyAdded: "API klíč uložen",
    pasteApiKey: "Vlož API klíč",
    saveKey: "Uložit",
    disconnect: "Odebrat klíč",
    modelLabel: "Model",
    modelsLoading: "Načítám modely…",
    formalityHint: "Má ti Honza tykat, nebo vykat?",
    formalityTy: "Ty",
    formalityVy: "Vy",
    contextHint:
      "Napiš instrukce, připoj Google Doc nebo nahraj .md soubor — Honza z toho čte.",
    instructionsLabel: "Tvoje instrukce",
    activeSources: "Aktivní zdroje",
    connectGoogleDoc: "Připojit",
    googleDocConnected: "Připojeno",
    googleDocFailed: "Nešlo načíst — zkontroluj odkaz",
    fileUploadHint: "Klepnutím vyber soubor",
    resetChat: "Resetovat chat",
    notificationsHint:
      "Upozornění, až bude Honza připraven psát ti první — zatím jen příprava.",
    notificationsOn: "Zapnout",
    notificationsOff: "Vypnout",
    notificationsDenied: "Povol oznámení v nastavení prohlížeče.",
    notificationsReady: "Připraveno — až bude plán aktivní, Honza ti napíše.",
    notificationsTurnedOff: "Oznámení vypnuta.",
    notificationsEnableFailed: "Oznámení se nepodařilo zapnout.",
    serverStatus: "Stav serveru",
    serverChecking: "…",
    serverConfigured: "připojeno",
    serverMissing: "chybí OPENROUTER_API_KEY",
    levelHint: "Honza přizpůsobí tempo, slovní zásobu a obtížnost.",
    levelHints: { A1: "Start", A2: "Základ", B1: "Dál", B2: "Pokroč." },
    topicsHint: "Vyber témata, o kterých chceš s Honzou mluvit.",
    contextSynced: (date, count) =>
      `Naposledy ${date} · ${count} zdroj${count === 1 ? "" : "ů"}, ze kterých Honza čte.`,
    contextEmpty:
      "Zatím nic. Přidej Google Doc, soubor nebo text, ať Honza ví, co se učíš.",
    googleDocLabel: "Google Doc (veřejný odkaz)",
    googleDocPlaceholder: "https://docs.google.com/document/d/…",
    googleDocAria: "URL Google dokumentu",
    fetching: "Načítám…",
    addFromGoogleDocs: "Přidat z Google Docs",
    pastedText: "Vložený text",
    pastedTextAria: "Vložený text",
    pastePlaceholder: "…nebo vlož text",
    addText: "Přidat text",
    updateText: "Aktualizovat text",
    textLoaded: "Už je v kontextu",
    fileLabel: "Soubor (.txt, .md)",
    googleDocKind: "Google Doc",
    remove: "Odebrat",
    resetData: "Smazat data a projít onboarding znovu",
    signOut: "Odhlásit se",
  },
  ...EXTENDED.cs,
};

export const STRINGS: Record<UiLocale, LocaleStrings> = { en, cs };

export function getStrings(locale: UiLocale): LocaleStrings {
  return STRINGS[locale] ?? STRINGS.en;
}
