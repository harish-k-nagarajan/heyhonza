import type { LevelId, TopicId } from "@/lib/constants";
import type { HonzaOrbState } from "@/components/honza/theme";
import type { CallPhase } from "@/hooks/useCallScreen";

export type CommonCopy = {
  loading: string;
  honza: string;
  you: string;
};

export type MoodStateCopy = { label: string; caption: string };

export type MoodCopy = {
  expression: Record<HonzaOrbState, MoodStateCopy>;
  recess: Record<HonzaOrbState, string>;
  recessThinking: string;
};

export type CallCopy = {
  titleReady: string;
  titleConnecting: string;
  titleSpeaking: string;
  titleListening: string;
  titleThinking: string;
  chipReady: string;
  chipConnecting: string;
  chipSpeaking: string;
  chipListening: string;
  chipWaiting: string;
  chipThinking: string;
  captionKicker: string;
  captionStatus: string;
  captionOffIdle: string;
  captionOffConnecting: string;
  callCta: string;
  endCall: string;
  speakerOnAria: string;
  speakerOffAria: string;
  liveCall: string;
  callHonza: string;
  callDurationAria: string;
  speak: string;
  stopSpeaking: string;
  endCallAria: string;
  endCallFooter: string;
  callHonzaCta: string;
  ringing: string;
  browserUnsupported: string;
  statusReady: string;
  statusConnecting: string;
  statusSpeaking: string;
  statusListening: string;
  statusTapMic: string;
  statusThinking: string;
};

export type OnboardingCopy = {
  loading: string;
  continue: string;
  startChatting: string;
  skip: string;
  stepOf: (step: number, total: number) => string;
  stepOptional: string;
  step1Title: string;
  step1Body: string;
  step2Title: string;
  step2Body: string;
  step3Title: string;
  step3Body: string;
  step4Title: string;
  step4Body: string;
  step5Title: string;
  step5Body: string;
  howOften: string;
  when: string;
  specificTime: string;
  random: string;
  firstMessage: string;
  firstMessageTimeAria: string;
  googleDoc: string;
  googleDocShare: string;
  fileOrPaste: string;
  documentUrl: string;
  orPasteText: string;
};

export type InstallCopy = {
  label: string;
  dismiss: string;
  body: string;
  install: string;
  iosShare: string;
  iosAdd: string;
  iosLead: string;
  iosTail: string;
};

export type WelcomeCopy = {
  logIn: string;
  heroHeadline: string;
  heroSubcopy: string;
  heroCta: string;
  heroCtaHint: string;
  signedOutHeadline: string;
  signedOutSubcopy: string;
  signedOutCta: string;
  signedOutCtaHint: string;
  sectionChatKicker: string;
  sectionChatTitle: string;
  sectionChatTitleLine2: string;
  sectionChatLead: string;
  sectionCallKicker: string;
  sectionCallTitle: string;
  sectionCallLead: string;
  sectionScheduleKicker: string;
  sectionScheduleTitle: string;
  sectionScheduleLead: string;
  schedulePreviewMessage: string;
  schedulePreviewHint: string;
  schedulePreviewAria: string;
  scheduleNotificationAppName: string;
  scheduleNotificationTime: string;
  sectionTopicsKicker: string;
  sectionTopicsTitle: string;
  sectionTopicsLead: string;
  sectionLevelsKicker: string;
  sectionLevelsTitle: string;
  sectionLevelsLead: string;
  honzaAsks: string;
  youReply: string;
  conversationPreview: string;
  preview: string;
  correction: string;
  online: string;
  speaking: string;
  youSaid: string;
  footerHeadline: string;
  footerNote: string;
  stickyCta: string;
  steps: readonly { n: string; title: string; body: string }[];
};

export type TopicsCopy = Record<TopicId, string>;

export type LevelsCopy = {
  option: Record<LevelId, string>;
  detail: Record<LevelId, string>;
  blurb: Record<LevelId, string>;
};

export type ErrorsCopy = {
  serverError: string;
  emptyResponse: string;
  unknownError: string;
  voiceUnavailable: string;
  honzaNoReply: string;
  couldNotReach: string;
  playbackFailed: string;
  audioBlocked: string;
  invalidUrl: string;
  importFailed: string;
  emptyServerResponse: string;
  networkError: string;
  fileType: string;
  fileEmpty: string;
  pastedTextLabel: string;
};

export type FileInputCopy = {
  chooseFile: string;
  noFile: string;
};

export type ExtendedCopy = {
  common: CommonCopy;
  mood: MoodCopy;
  call: CallCopy;
  onboarding: OnboardingCopy;
  install: InstallCopy;
  welcome: WelcomeCopy;
  topics: TopicsCopy;
  levels: LevelsCopy;
  errors: ErrorsCopy;
  fileInput: FileInputCopy;
};

const enExtended: ExtendedCopy = {
  common: {
    loading: "Loading…",
    honza: "Honza",
    you: "You",
  },
  mood: {
    expression: {
      idle: { label: "CALM", caption: "Waiting for you" },
      thinking: { label: "THINKING", caption: "Thinking" },
      speaking: { label: "SPEAKING", caption: "Replying" },
      oops: { label: "OOPS", caption: "Gently correcting" },
      excited: { label: "GREAT", caption: "Great!" },
    },
    recess: {
      idle: "WAITING",
      thinking: "THINKING",
      speaking: "SPEAKING",
      oops: "ERROR",
      excited: "GREAT",
    },
    recessThinking: "THINKING",
  },
  call: {
    titleReady: "Call with Honza",
    titleConnecting: "Connecting…",
    titleSpeaking: "Honza is speaking…",
    titleListening: "Listening…",
    titleThinking: "Honza is thinking…",
    chipReady: "ready",
    chipConnecting: "ringing",
    chipSpeaking: "speaking",
    chipListening: "listening",
    chipWaiting: "waiting for you",
    chipThinking: "thinking",
    captionKicker: "CAPTIONS",
    captionStatus: "STATUS",
    captionOffIdle: "Captions appear here when Honza speaks.",
    captionOffConnecting: "Calling… Honza's words will appear here.",
    callCta: "Call",
    endCall: "End",
    speakerOnAria: "Using phone speaker — switch to earpiece",
    speakerOffAria: "Using earpiece — switch to phone speaker",
    liveCall: "Live call",
    callHonza: "Call Honza",
    callDurationAria: "Call duration",
    speak: "Speak",
    stopSpeaking: "Stop speaking",
    endCallAria: "End call",
    endCallFooter: "End call → transcript in Chat",
    callHonzaCta: "CALL HONZA",
    ringing: "Ringing…",
    browserUnsupported:
      "Speech recognition needs Chrome, Edge or Safari. In other browsers, use Chat instead.",
    statusReady: "Tap to call — you'll speak Czech, he'll answer out loud.",
    statusConnecting: "Ringing…",
    statusSpeaking: "Honza is speaking…",
    statusListening: "Listening… speak Czech",
    statusTapMic: "Tap the mic to answer",
    statusThinking: "Honza is thinking…",
  },
  onboarding: {
    loading: "Loading…",
    continue: "Continue",
    startChatting: "Start chatting",
    skip: "Skip for now",
    stepOf: (step, total) => `STEP ${step} OF ${total}`,
    stepOptional: "STEP 5 OF 5 · OPTIONAL",
    step1Title: "Ahoj! I'm Honza.",
    step1Body:
      "I'll write to you in Czech about real things. You reply. I fix your mistakes — kindly.",
    step2Title: "What's your level?",
    step2Body: "Honza adapts to where you are — from first sentences to almost fluent.",
    step3Title: "What do you want to talk about?",
    step3Body: "Pick topics you care about — not textbook phrases.",
    step4Title: "When should Honza write?",
    step4Body: "Honza can message you 1–3 times a day. Pick a time or let it feel random.",
    step5Title: "Teach Honza about you",
    step5Body: "Add a Google Doc, file, or paste — or skip and add this later in Settings.",
    howOften: "HOW OFTEN",
    when: "WHEN",
    specificTime: "Specific time",
    random: "Random",
    firstMessage: "First message",
    firstMessageTimeAria: "First message time",
    googleDoc: "GOOGLE DOC",
    googleDocShare:
      "Set the doc to Share → Anyone with the link → Viewer so Honza can read it.",
    fileOrPaste: "FILE OR PASTE",
    documentUrl: "Document URL",
    orPasteText: "Or paste text",
  },
  install: {
    label: "INSTALL",
    dismiss: "Not now",
    body: "Install Honza for quicker daily practice.",
    install: "Install",
    iosShare: "Share",
    iosAdd: "Add to Home Screen",
    iosLead: "Add Honza to your home screen: tap",
    iosTail: ".",
  },
  welcome: {
    logIn: "Log in",
    heroHeadline: "Learn Czech by texting a friend",
    heroSubcopy:
      "No streak, no leaderboard. Open the app and Honza is already writing to you in Czech",
    heroCta: "Say hi to Honza",
    heroCtaHint: "Free · takes a minute",
    signedOutHeadline: "Honza will be here when you are",
    signedOutSubcopy:
      "Your progress is saved. Sign back in and we pick up the Czech chat where you left off",
    signedOutCta: "Sign back in",
    signedOutCtaHint: "Same account · one tap",
    sectionChatKicker: "WHAT IT LOOKS LIKE",
    sectionChatTitle: "Honza writes first",
    sectionChatTitleLine2: "You reply in Czech",
    sectionChatLead: "Gentle corrections, then the chat continues",
    sectionCallKicker: "PRACTICE SPEAKING",
    sectionCallTitle: "Call him when you're ready",
    sectionCallLead: "Speak Czech out loud and he talks back",
    sectionScheduleKicker: "DAILY CHECK-INS",
    sectionScheduleTitle: "Pick when Honza writes",
    sectionScheduleLead: "One to three Czech messages a day",
    schedulePreviewMessage: "Ahoj! Co dnes vaříš? Napiš mi česky, klidně blbě",
    schedulePreviewHint: "Add Honza to your home screen so it works on iPhone and Android",
    schedulePreviewAria: "Settings preview and iPhone notification preview",
    scheduleNotificationAppName: "HONZA",
    scheduleNotificationTime: "now",
    sectionTopicsKicker: "TOPICS",
    sectionTopicsTitle: "What you'll talk about",
    sectionTopicsLead: "Pick topics you care about, then talk in Czech",
    sectionLevelsKicker: "LEVELS",
    sectionLevelsTitle: "Meets you at your level",
    sectionLevelsLead: "From first sentences to almost fluent",
    honzaAsks: "Honza asks",
    youReply: "You reply",
    conversationPreview: "Conversation preview",
    preview: "Preview",
    correction: "Correction",
    online: "online",
    speaking: "speaking",
    youSaid: "YOU SAID",
    footerHeadline: "Ready to say ahoj?",
    footerNote: "Free to start. Add Honza to your home screen and he lives on your phone",
    stickyCta: "Say hi to Honza",
    steps: [
      {
        n: "01",
        title: "Honza starts",
        body: "Open the app and a Czech message is already waiting, about something you care about",
      },
      {
        n: "02",
        title: "You reply in Czech",
        body: "Type it back, even badly. Getting it wrong is where the learning happens",
      },
      {
        n: "03",
        title: "He fixes it, kindly",
        body: "Honza corrects the slip, tells you why, and keeps going",
      },
    ],
  },
  topics: {
    daily: "Daily life",
    travel: "Travel",
    food: "Food",
    work: "Work",
    grammar: "Grammar",
    smalltalk: "Small talk",
  },
  levels: {
    option: {
      A1: "A1 · Beginner",
      A2: "A2 · Elementary",
      B1: "B1 · Intermediate",
      B2: "B2 · Upper-int.",
    },
    detail: {
      A1: "Beginner — zero stress.",
      A2: "Elementary — I push you further.",
      B1: "Intermediate — real topics.",
      B2: "Upper-int — almost fluent.",
    },
    blurb: {
      A1: "Short sentences, zero stress",
      A2: "Honza pushes you further",
      B1: "Real topics, gentle fixes",
      B2: "Almost fluent, still learning",
    },
  },
  errors: {
    serverError: "Server error",
    emptyResponse: "Empty response",
    unknownError: "Unknown error",
    voiceUnavailable: "Honza's voice is unavailable.",
    honzaNoReply: "Honza didn't reply.",
    couldNotReach: "Couldn't reach Honza.",
    playbackFailed: "Playback failed.",
    audioBlocked: "Your browser blocked audio playback. Tap to start the call first.",
    invalidUrl: "Enter a valid Google Doc URL.",
    importFailed: "Import failed.",
    emptyServerResponse: "Empty server response.",
    networkError: "Network error.",
    fileType: "Only .txt and .md files are supported.",
    fileEmpty: "File is empty.",
    pastedTextLabel: "Pasted text",
  },
  fileInput: {
    chooseFile: "Choose file",
    noFile: "No file",
  },
};

const csExtended: ExtendedCopy = {
  common: {
    loading: "Načítání…",
    honza: "Honza",
    you: "Ty",
  },
  mood: {
    expression: {
      idle: { label: "KLID", caption: "Čeká na tebe" },
      thinking: { label: "MYSLÍ", caption: "Přemýšlí" },
      speaking: { label: "MLUVÍ", caption: "Odpovídá" },
      oops: { label: "CHYBA", caption: "Jemně opravuje" },
      excited: { label: "SKVĚLE", caption: "Skvěle!" },
    },
    recess: {
      idle: "ČEKÁ",
      thinking: "PŘEMÝŠLÍ",
      speaking: "MLUVÍ",
      oops: "CHYBA",
      excited: "SKVĚLE",
    },
    recessThinking: "PŘEMÝŠLÍ",
  },
  call: {
    titleReady: "Hovor s Honzou",
    titleConnecting: "Spojuji hovor…",
    titleSpeaking: "Honza mluví…",
    titleListening: "Poslouchám…",
    titleThinking: "Honza přemýšlí…",
    chipReady: "připraven",
    chipConnecting: "vyzvání",
    chipSpeaking: "mluví",
    chipListening: "poslouchá",
    chipWaiting: "čeká na tebe",
    chipThinking: "přemýšlí",
    captionKicker: "TITULKY",
    captionStatus: "STAV",
    captionOffIdle: "Titulky se objeví, když Honza mluví.",
    captionOffConnecting: "Volá se… Honzovy slova se objeví zde.",
    callCta: "Zavolat",
    endCall: "Ukončit",
    speakerOnAria: "Reproduktor telefonu — přepnout na sluchátko",
    speakerOffAria: "Sluchátko — přepnout na reproduktor telefonu",
    liveCall: "Probíhající hovor",
    callHonza: "Zavolat Honzovi",
    callDurationAria: "Délka hovoru",
    speak: "Mluvit",
    stopSpeaking: "Přestat mluvit",
    endCallAria: "Ukončit hovor",
    endCallFooter: "Ukončit hovor → přepis v chatu",
    callHonzaCta: "ZAVOLAT HONZOVI",
    ringing: "Vyzvání…",
    browserUnsupported:
      "Rozpoznávání řeči potřebuje Chrome, Edge nebo Safari. Jinde použij chat.",
    statusReady: "Klepni a zavolej — ty mluvíš česky, Honza odpoví nahlas.",
    statusConnecting: "Vyzvání…",
    statusSpeaking: "Honza mluví…",
    statusListening: "Poslouchám… mluv česky",
    statusTapMic: "Klepni na mikrofon a odpověz",
    statusThinking: "Honza přemýšlí…",
  },
  onboarding: {
    loading: "Načítání…",
    continue: "Pokračovat",
    startChatting: "Začít chatovat",
    skip: "Přeskočit",
    stepOf: (step, total) => `KROK ${step} Z ${total}`,
    stepOptional: "KROK 5 Z 5 · VOLITELNÉ",
    step1Title: "Ahoj! Já jsem Honza.",
    step1Body:
      "Budu ti psát česky o reálných věcech. Ty odpovíš. Chyby opravím — laskavě.",
    step2Title: "Jaká je tvoje úroveň?",
    step2Body: "Honza se přizpůsobí — od prvních vět až skoro k plynulosti.",
    step3Title: "O čem chceš mluvit?",
    step3Body: "Vyber témata, která tě zajímají — ne učebnicové fráze.",
    step4Title: "Kdy má Honza psát?",
    step4Body: "Honza ti může napsat 1–3× denně. Vyber čas, nebo to nech náhodně.",
    step5Title: "Řekni Honzovi něco o sobě",
    step5Body: "Přidej Google Doc, soubor nebo text — nebo přeskoč a doplň to v nastavení.",
    howOften: "JAK ČASTO",
    when: "KDY",
    specificTime: "Konkrétní čas",
    random: "Náhodně",
    firstMessage: "První zpráva",
    firstMessageTimeAria: "Čas první zprávy",
    googleDoc: "GOOGLE DOC",
    googleDocShare:
      "Nastav dokument na Sdílet → Kdokoli s odkazem → Prohlížející, ať ho Honza přečte.",
    fileOrPaste: "SOUBOR NEBO TEXT",
    documentUrl: "URL dokumentu",
    orPasteText: "Nebo vlož text",
  },
  install: {
    label: "Instalace",
    dismiss: "Teď ne",
    body: "Nainstaluj Honzu pro rychlejší každodenní procvičování.",
    install: "Instalovat",
    iosShare: "Sdílet",
    iosAdd: "Přidat na plochu",
    iosLead: "Přidej Honzu na plochu: klepni na",
    iosTail: ".",
  },
  welcome: {
    logIn: "Přihlásit se",
    heroHeadline: "Uč se česky psaním s kamarádem",
    heroSubcopy:
      "Žádná série, žádný žebříček. Otevři appku a Honza ti už píše česky",
    heroCta: "Pozdrav Honzu",
    heroCtaHint: "Zdarma · za minutu",
    signedOutHeadline: "Honza tu bude, až budeš chtít",
    signedOutSubcopy:
      "Tvůj pokrok je uložený. Přihlas se a navážeme tam, kde jsme s češtinou skončili",
    signedOutCta: "Přihlásit se znovu",
    signedOutCtaHint: "Stejný účet · jedno klepnutí",
    sectionChatKicker: "JAK TO VYPADÁ",
    sectionChatTitle: "Honza píše první",
    sectionChatTitleLine2: "Ty odpovíš česky",
    sectionChatLead: "Laskavě opraví a povídá si dál",
    sectionCallKicker: "MLUVENÍ",
    sectionCallTitle: "Zavolej mu, až budeš chtít",
    sectionCallLead: "Mluv česky nahlas a on ti odpoví",
    sectionScheduleKicker: "DENNÍ ZPRÁVY",
    sectionScheduleTitle: "Vyber, kdy Honza píše",
    sectionScheduleLead: "Jedna až tři české zprávy denně",
    schedulePreviewMessage: "Ahoj! Co dnes vaříš? Napiš mi česky, klidně blbě",
    schedulePreviewHint: "Přidej Honzu na plochu, ať to funguje na iPhonu i Androidu",
    schedulePreviewAria: "Náhled nastavení a oznámení na iPhonu",
    scheduleNotificationAppName: "HONZA",
    scheduleNotificationTime: "teď",
    sectionTopicsKicker: "TÉMATA",
    sectionTopicsTitle: "O čem půjde řeč",
    sectionTopicsLead: "Vyber témata, která tě zajímají, a mluv o nich česky",
    sectionLevelsKicker: "ÚROVNĚ",
    sectionLevelsTitle: "Na tvé úrovni",
    sectionLevelsLead: "Od prvních vět až skoro k plynulosti",
    honzaAsks: "Honza se ptá",
    youReply: "Ty odpovídáš",
    conversationPreview: "Náhled konverzace",
    preview: "Náhled",
    correction: "Oprava",
    online: "online",
    speaking: "mluví",
    youSaid: "TVOJE SLOVA",
    footerHeadline: "Máš chuť říct ahoj?",
    footerNote: "Začni zdarma. Přidej Honzu na plochu a zůstane v telefonu jako každá appka",
    stickyCta: "Pozdrav Honzu",
    steps: [
      {
        n: "01",
        title: "Honza začíná",
        body: "Otevřeš appku a zpráva už na tebe čeká, česky a o něčem, co tě zajímá",
      },
      {
        n: "02",
        title: "Odepíšeš česky",
        body: "Napiš to zpátky, klidně blbě. Právě v chybách se to naučíš",
      },
      {
        n: "03",
        title: "Laskavě to opraví",
        body: "Honza chybu opraví, řekne proč a povídá si dál",
      },
    ],
  },
  topics: {
    daily: "Každodenní život",
    travel: "Cestování",
    food: "Jídlo",
    work: "Práce",
    grammar: "Gramatika",
    smalltalk: "Small talk",
  },
  levels: {
    option: {
      A1: "A1 · Začátečník",
      A2: "A2 · Základy",
      B1: "B1 · Středně pokr.",
      B2: "B2 · Pokročilý",
    },
    detail: {
      A1: "Začátečník — bez stresu.",
      A2: "Základy — posunu tě dál.",
      B1: "Středně pokročilý — reálná témata.",
      B2: "Pokročilý — skoro plynule.",
    },
    blurb: {
      A1: "Krátké věty, bez stresu",
      A2: "Honza tě posune dál",
      B1: "Reálná témata, jemné opravy",
      B2: "Skoro plynule, pořád se učíš",
    },
  },
  errors: {
    serverError: "Chyba serveru",
    emptyResponse: "Prázdná odpověď",
    unknownError: "Neznámá chyba",
    voiceUnavailable: "Honzův hlas není dostupný.",
    honzaNoReply: "Honza neodpověděl.",
    couldNotReach: "Honza je nedostupný.",
    playbackFailed: "Přehrávání selhalo.",
    audioBlocked: "Prohlížeč zablokoval zvuk. Nejdřív klepni a zavolej.",
    invalidUrl: "Zadej platnou URL Google dokumentu.",
    importFailed: "Import se nepovedl.",
    emptyServerResponse: "Prázdná odpověď serveru.",
    networkError: "Chyba sítě.",
    fileType: "Podporované jsou jen soubory .txt a .md.",
    fileEmpty: "Soubor je prázdný.",
    pastedTextLabel: "Vložený text",
  },
  fileInput: {
    chooseFile: "Vybrat soubor",
    noFile: "Žádný soubor",
  },
};

export const EXTENDED: Record<"en" | "cs", ExtendedCopy> = { en: enExtended, cs: csExtended };

export function callTitle(phase: CallPhase, c: CallCopy): string {
  switch (phase) {
    case "ready":
      return c.titleReady;
    case "connecting":
      return c.titleConnecting;
    case "speaking":
      return c.titleSpeaking;
    case "listening":
      return c.titleListening;
    case "thinking":
      return c.titleThinking;
    default: {
      const _exhaustive: never = phase;
      return _exhaustive;
    }
  }
}

export function callChip(phase: CallPhase, listening: boolean, c: CallCopy): string {
  switch (phase) {
    case "ready":
      return c.chipReady;
    case "connecting":
      return c.chipConnecting;
    case "speaking":
      return c.chipSpeaking;
    case "listening":
      return listening ? c.chipListening : c.chipWaiting;
    case "thinking":
      return c.chipThinking;
    default: {
      const _exhaustive: never = phase;
      return _exhaustive;
    }
  }
}

export function callStatusLine(
  phase: CallPhase,
  listening: boolean,
  c: CallCopy,
): string {
  switch (phase) {
    case "ready":
      return c.statusReady;
    case "connecting":
      return c.statusConnecting;
    case "speaking":
      return c.statusSpeaking;
    case "listening":
      return listening ? c.statusListening : c.statusTapMic;
    case "thinking":
      return c.statusThinking;
    default: {
      const _exhaustive: never = phase;
      return _exhaustive;
    }
  }
}

/** Map known English client error strings to localized copy. */
export function localizeClientError(message: string | null, errors: ErrorsCopy): string | null {
  if (!message) return null;
  const map: Record<string, string> = {
    "Server error": errors.serverError,
    "Empty response": errors.emptyResponse,
    "Unknown error": errors.unknownError,
    "Honza's voice is unavailable.": errors.voiceUnavailable,
    "Honza didn't reply.": errors.honzaNoReply,
    "Couldn't reach Honza.": errors.couldNotReach,
    "Playback failed.": errors.playbackFailed,
    "Your browser blocked audio playback. Tap to start the call first.":
      errors.audioBlocked,
    "Invalid URL.": errors.invalidUrl,
    "Enter a valid Google Doc URL.": errors.invalidUrl,
    "Import failed.": errors.importFailed,
    "Empty server response.": errors.emptyServerResponse,
    "Network error.": errors.networkError,
    "Only .txt and .md files are supported.": errors.fileType,
    "File is empty.": errors.fileEmpty,
    "Pasted text": errors.pastedTextLabel,
    Error: errors.importFailed,
  };
  return map[message] ?? message;
}
