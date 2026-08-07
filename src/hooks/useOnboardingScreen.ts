"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useScreenReady } from "@/hooks/useScreenReady";
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

export type OnboardingStep = 1 | 2 | 3 | 4 | 5;

/**
 * Behaviour for the 5-step onboarding flow (Handoff — Onboarding Flow):
 * Intro → Level → Topics → Schedule → Context (optional) → Chat.
 */
export type OnboardingScreen = {
  ready: boolean;
  design: DesignId;
  family: DesignFamily;
  step: OnboardingStep;
  continue: () => void;
  skip: () => void;

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

export function useOnboardingScreen(): OnboardingScreen {
  const router = useRouter();
  const ready = useScreenReady();
  const onboardingComplete = useSettingsStore((s) => s.onboardingComplete);
  const setOnboardingComplete = useSettingsStore((s) => s.setOnboardingComplete);
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

  const design = useDesignStore((s) => s.design);

  const [step, setStep] = useState<OnboardingStep>(1);
  const [docUrl, setDocUrl] = useState("");
  const [paste, setPaste] = useState("");
  const [docLoading, setDocLoading] = useState(false);
  const [docError, setDocError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  useEffect(() => {
    if (ready && onboardingComplete) router.replace(ROUTES.chat);
  }, [ready, onboardingComplete, router]);

  const toggleTopic = (id: TopicId) => {
    const next = selectedTopics.includes(id)
      ? selectedTopics.filter((t) => t !== id)
      : [...selectedTopics, id];
    setTopics(next);
    persistProfile({ topics: next });
  };

  const chooseLevel = (l: LevelId) => {
    setLevel(l);
    persistProfile({ level: l });
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
    void (async () => {
      await flushPaste();
      setOnboardingComplete(true);
      persistProfile({
        onboardingCompleted: true,
        topics: selectedTopics,
        level,
      });
      router.push(ROUTES.chat);
    })();
  };

  const continueFlow = () => {
    if (step < 5) {
      setStep((s) => (s + 1) as OnboardingStep);
      return;
    }
    finish();
  };

  const setPasteValue = (v: string) => {
    setFileError(null);
    setPaste(v);
  };

  return {
    ready,
    design,
    family: DESIGNS[design].family,
    step,
    continue: continueFlow,
    skip: finish,
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
