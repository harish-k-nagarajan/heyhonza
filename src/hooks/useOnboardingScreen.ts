"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useScreenReady } from "@/hooks/useScreenReady";
import { isLikelyGoogleDocUrl } from "@/lib/validators";
import { addContext, persistProfile } from "@/lib/client/context-actions";
import { ROUTES } from "@/lib/constants";
import { DESIGNS } from "@/lib/design/registry";
import type { DesignFamily, DesignId } from "@/lib/design/registry";
import type { LevelId, TopicId } from "@/lib/constants";
import { useDesignStore } from "@/stores/useDesignStore";
import { useSettingsStore } from "@/stores/useSettingsStore";

/**
 * Behaviour for the onboarding flow, extracted so Classic and Hmat share one
 * source of truth. Same steps as the shipped screen: pick a level + topics,
 * optionally teach Honza some context (Google Doc / file / paste), then finish.
 */
export type OnboardingScreen = {
  ready: boolean;
  design: DesignId;
  family: DesignFamily;

  level: LevelId;
  chooseLevel: (l: LevelId) => void;
  topics: TopicId[];
  toggleTopic: (id: TopicId) => void;

  docUrl: string;
  setDocUrl: (v: string) => void;
  docLoading: boolean;
  docError: string | null;
  importGoogleDoc: () => void;

  paste: string;
  setPaste: (v: string) => void;
  fileError: string | null;
  onFile: (f: File | null) => void;
  addPaste: () => void;

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

  const design = useDesignStore((s) => s.design);

  const [docUrl, setDocUrl] = useState("");
  const [paste, setPaste] = useState("");
  const [docLoading, setDocLoading] = useState(false);
  const [docError, setDocError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  useEffect(() => {
    if (ready && onboardingComplete) router.replace(ROUTES.home);
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

  const addPaste = () => {
    setFileError(null);
    const t = paste.trim();
    if (!t) {
      setFileError("Paste some text.");
      return;
    }
    void addContext(t, { kind: "pasted", label: "Pasted text", addedAt: Date.now() });
    setPaste("");
  };

  const finish = () => {
    setOnboardingComplete(true);
    // Persist the full onboarding payload as one data model: onboarding flag +
    // the same Settings fields (topics, level).
    persistProfile({ onboardingCompleted: true, topics: selectedTopics, level });
    router.push(ROUTES.home);
  };

  return {
    ready,
    design,
    family: DESIGNS[design].family,
    level,
    chooseLevel,
    topics: selectedTopics,
    toggleTopic,
    docUrl,
    setDocUrl,
    docLoading,
    docError,
    importGoogleDoc,
    paste,
    setPaste,
    fileError,
    onFile,
    addPaste,
    finish,
  };
}
