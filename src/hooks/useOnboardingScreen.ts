"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { rememberProviderStatusFromResponse } from "@/hooks/useProviderStatus";
import { useScreenReady } from "@/hooks/useScreenReady";
import type { ProviderUiStatus } from "@/hooks/useSettingsScreen";
import { addContext, persistProfile } from "@/lib/client/context-actions";
import { ROUTES } from "@/lib/constants";
import { DESIGNS } from "@/lib/design/registry";
import type { DesignFamily, DesignId } from "@/lib/design/registry";
import type {
  DailyMessageCount,
  LevelId,
  ScheduleMode,
  TopicId,
} from "@/lib/constants";
import { isLikelyGoogleDocUrl } from "@/lib/validators";
import { useDesignStore } from "@/stores/useDesignStore";
import { useSettingsStore } from "@/stores/useSettingsStore";

const TOTAL_STEPS = 6;

export type OnboardingStep = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * Behaviour for the 6-step onboarding flow:
 * Intro → Level → Topics → Schedule → API keys → Context (optional) → Chat.
 */
export type OnboardingScreen = {
  ready: boolean;
  /** True while wrapping up — avoids flashing step 1 before route change. */
  finishing: boolean;
  design: DesignId;
  family: DesignFamily;
  step: OnboardingStep;
  totalSteps: number;
  continue: () => void;
  skip: () => void;
  skipScheduleSetup: () => void;

  level: LevelId;
  chooseLevel: (l: LevelId) => void;
  topics: TopicId[];
  toggleTopic: (id: TopicId) => void;

  dailyMessageCount: DailyMessageCount;
  setDailyMessageCount: (count: DailyMessageCount) => void;
  scheduleMode: ScheduleMode;
  setScheduleMode: (mode: ScheduleMode) => void;
  firstMessageTime: string;
  setFirstMessageTime: (time: string) => void;
  secondMessageTime: string | null;
  setSecondMessageTime: (time: string) => void;
  thirdMessageTime: string | null;
  setThirdMessageTime: (time: string) => void;

  llm: ProviderUiStatus | null;
  tts: ProviderUiStatus | null;
  providerBusy: boolean;
  saveProviderKey: (provider: "openrouter" | "elevenlabs", key: string) => Promise<string | null>;
  disconnectProvider: (provider: "openrouter" | "elevenlabs") => Promise<void>;

  docUrl: string;
  setDocUrl: (v: string) => void;
  docLoading: boolean;
  docError: string | null;
  importGoogleDoc: () => void;

  paste: string;
  setPaste: (v: string) => void;
  fileError: string | null;
  onFile: (f: File | null) => void;

  finish: () => void;
};

function detectTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

export function useOnboardingScreen(): OnboardingScreen {
  const router = useRouter();
  const ready = useScreenReady();
  const onboardingComplete = useSettingsStore((s) => s.onboardingComplete);
  const setOnboardingComplete = useSettingsStore((s) => s.setOnboardingComplete);
  const step = useSettingsStore((s) => s.onboardingStep);
  const setOnboardingStep = useSettingsStore((s) => s.setOnboardingStep);
  const selectedTopics = useSettingsStore((s) => s.selectedTopics);
  const setTopics = useSettingsStore((s) => s.setTopics);
  const level = useSettingsStore((s) => s.level);
  const setLevel = useSettingsStore((s) => s.setLevel);
  const dailyMessageCount = useSettingsStore((s) => s.dailyMessageCount);
  const setDailyMessageCount = useSettingsStore((s) => s.setDailyMessageCount);
  const scheduleMode = useSettingsStore((s) => s.scheduleMode);
  const setScheduleMode = useSettingsStore((s) => s.setScheduleMode);
  const firstMessageTime = useSettingsStore((s) => s.firstMessageTime);
  const setFirstMessageTime = useSettingsStore((s) => s.setFirstMessageTime);
  const secondMessageTime = useSettingsStore((s) => s.secondMessageTime);
  const setSecondMessageTime = useSettingsStore((s) => s.setSecondMessageTime);
  const thirdMessageTime = useSettingsStore((s) => s.thirdMessageTime);
  const setThirdMessageTime = useSettingsStore((s) => s.setThirdMessageTime);
  const setScheduleEnabled = useSettingsStore((s) => s.setScheduleEnabled);

  const design = useDesignStore((s) => s.design);

  const [docUrl, setDocUrl] = useState("");
  const [paste, setPaste] = useState("");
  const [docLoading, setDocLoading] = useState(false);
  const [docError, setDocError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [llm, setLlm] = useState<ProviderUiStatus | null>(null);
  const [tts, setTts] = useState<ProviderUiStatus | null>(null);
  const [providerBusy, setProviderBusy] = useState(false);
  const [finishing, setFinishing] = useState(false);

  useEffect(() => {
    if (ready && onboardingComplete) router.replace(ROUTES.chat);
  }, [ready, onboardingComplete, router]);

  const refreshProviders = useCallback(async () => {
    try {
      const res = await fetch("/api/providers/status", { cache: "no-store" });
      const data = (await res.json()) as {
        llm?: ProviderUiStatus;
        tts?: ProviderUiStatus;
      };
      if (data.llm) setLlm(data.llm);
      if (data.tts) setTts(data.tts);
      rememberProviderStatusFromResponse(data);
    } catch {
      setLlm({ source: "none", connected: false });
      setTts({ source: "none", connected: false });
      rememberProviderStatusFromResponse({});
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    void fetch("/api/providers/status", { cache: "no-store" })
      .then((res) => res.json())
      .then((data: { llm?: ProviderUiStatus; tts?: ProviderUiStatus }) => {
        if (cancelled) return;
        if (data.llm) setLlm(data.llm);
        if (data.tts) setTts(data.tts);
        rememberProviderStatusFromResponse(data);
      })
      .catch(() => {
        if (cancelled) return;
        setLlm({ source: "none", connected: false });
        setTts({ source: "none", connected: false });
        rememberProviderStatusFromResponse({});
      });
    return () => {
      cancelled = true;
    };
  }, [ready]);

  const goToStep = useCallback(
    (next: OnboardingStep) => {
      setOnboardingStep(next);
      void persistProfile({ onboardingStep: next });
    },
    [setOnboardingStep],
  );

  const persistSchedule = useCallback(
    (enabled: boolean) => {
      const tz = detectTimezone();
      void persistProfile({
        timezone: tz,
        scheduleEnabled: enabled,
        dailyMessageCount,
        scheduleMode,
        firstMessageTime,
        secondMessageTime,
        thirdMessageTime,
      });
    },
    [dailyMessageCount, firstMessageTime, scheduleMode, secondMessageTime, thirdMessageTime],
  );

  const toggleTopic = (id: TopicId) => {
    const next = selectedTopics.includes(id)
      ? selectedTopics.filter((t) => t !== id)
      : [...selectedTopics, id];
    setTopics(next);
    void persistProfile({ topics: next });
  };

  const chooseLevel = (l: LevelId) => {
    setLevel(l);
    void persistProfile({ level: l });
  };

  const importGoogleDoc = () => {
    void (async () => {
      setDocError(null);
      if (!isLikelyGoogleDocUrl(docUrl)) {
        setDocError("Enter a valid Google Doc URL (anyone with the link).");
        return;
      }
      setDocLoading(true);
      try {
        const res = await fetch("/api/context/google-doc", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: docUrl.trim() }),
        });
        const data = (await res.json()) as { text?: string; error?: string };
        if (!res.ok) {
          setDocError(data.error ?? "Import failed.");
          return;
        }
        if (!data.text) {
          setDocError("Empty server response.");
          return;
        }
        await addContext(data.text, {
          kind: "google_doc",
          url: docUrl.trim(),
          addedAt: Date.now(),
        });
        setDocUrl("");
      } catch {
        setDocError("Network error.");
      } finally {
        setDocLoading(false);
      }
    })();
  };

  const onFile = (f: File | null) => {
    void (async () => {
      setFileError(null);
      if (!f) return;
      if (!/\.(txt|md)$/i.test(f.name)) {
        setFileError("Only .txt and .md files are supported for now.");
        return;
      }
      const text = await f.text();
      if (!text.trim()) {
        setFileError("File is empty.");
        return;
      }
      await addContext(text.trim(), { kind: "file", name: f.name, addedAt: Date.now() });
    })();
  };

  const addPaste = async (text: string) => {
    const t = text.trim();
    if (!t) return;
    await addContext(t, { kind: "pasted", label: "Pasted text", addedAt: Date.now() });
    setPaste("");
  };

  const pasteSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const t = paste.trim();
    if (!t) return;
    if (pasteSaveTimer.current) clearTimeout(pasteSaveTimer.current);
    pasteSaveTimer.current = setTimeout(() => {
      void addPaste(t);
    }, 800);
    return () => {
      if (pasteSaveTimer.current) clearTimeout(pasteSaveTimer.current);
    };
  }, [paste]);

  const flushPaste = async () => {
    if (pasteSaveTimer.current) {
      clearTimeout(pasteSaveTimer.current);
      pasteSaveTimer.current = null;
    }
    await addPaste(paste);
  };

  const finish = () => {
    if (finishing || onboardingComplete) return;
    setFinishing(true);
    void (async () => {
      await flushPaste();
      const enabled = useSettingsStore.getState().scheduleEnabled;
      await persistProfile({
        onboardingCompleted: true,
        onboardingStep: 1,
        topics: selectedTopics,
        level,
        scheduleEnabled: enabled,
        dailyMessageCount,
        scheduleMode,
        firstMessageTime,
        secondMessageTime,
        thirdMessageTime,
        timezone: detectTimezone(),
      });
      setOnboardingComplete(true);
      setOnboardingStep(1);
      router.replace(ROUTES.chat);
    })();
  };

  const advanceFromSchedule = (enableReminders: boolean) => {
    setScheduleEnabled(enableReminders);
    persistSchedule(enableReminders);
    goToStep(5);
  };

  const skipScheduleSetup = () => {
    advanceFromSchedule(false);
  };

  const continueFlow = () => {
    if (step === 4) {
      advanceFromSchedule(true);
      return;
    }
    if (step < TOTAL_STEPS) {
      goToStep((step + 1) as OnboardingStep);
      return;
    }
    finish();
  };

  const saveProviderKey = async (
    provider: "openrouter" | "elevenlabs",
    key: string,
  ): Promise<string | null> => {
    setProviderBusy(true);
    try {
      const res = await fetch("/api/providers/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, key }),
      });
      const data = (await res.json()) as { ok?: boolean; reason?: string };
      if (!res.ok || !data.ok) return data.reason ?? "Could not save that key.";
      await refreshProviders();
      return null;
    } catch {
      return "Network error.";
    } finally {
      setProviderBusy(false);
    }
  };

  const disconnectProvider = async (provider: "openrouter" | "elevenlabs") => {
    setProviderBusy(true);
    try {
      await fetch("/api/providers/keys", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider }),
      });
      await refreshProviders();
    } finally {
      setProviderBusy(false);
    }
  };

  const setPasteValue = (v: string) => {
    setFileError(null);
    setPaste(v);
  };

  return {
    ready,
    finishing,
    design,
    family: DESIGNS[design].family,
    step: step as OnboardingStep,
    totalSteps: TOTAL_STEPS,
    continue: continueFlow,
    skip: finish,
    skipScheduleSetup,
    level,
    chooseLevel,
    topics: selectedTopics,
    toggleTopic,
    dailyMessageCount,
    setDailyMessageCount,
    scheduleMode,
    setScheduleMode,
    firstMessageTime,
    setFirstMessageTime,
    secondMessageTime,
    setSecondMessageTime,
    thirdMessageTime,
    setThirdMessageTime,
    llm,
    tts,
    providerBusy,
    saveProviderKey,
    disconnectProvider,
    docUrl,
    setDocUrl,
    docLoading,
    docError,
    importGoogleDoc,
    paste,
    setPaste: setPasteValue,
    fileError,
    onFile,
    finish,
  };
}
