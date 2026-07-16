"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useMoodExpression } from "@/hooks/useMoodExpression";
import { useScreenReady } from "@/hooks/useScreenReady";
import { isLikelyGoogleDocUrl } from "@/lib/validators";
import {
  addContext,
  persistProfile,
  removeContext,
  resetUserData,
} from "@/lib/client/context-actions";
import { ROUTES } from "@/lib/constants";
import { DESIGNS } from "@/lib/design/registry";
import type { DesignFamily, DesignId } from "@/lib/design/registry";
import type { LevelId, ModelId, TopicId } from "@/lib/constants";
import type { MoodExpression } from "@/lib/mood/expression";
import { useDesignStore } from "@/stores/useDesignStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import type { ContextChunk } from "@/types";

/**
 * Behaviour for the Settings surface, extracted so Classic and Hmat share one
 * source of truth for the profile form (level, model, topics), the context
 * documents (Google Doc / file / paste), server status, and data reset. The
 * Design Lab (Phase 6) is a separate shared section that reads the design store
 * directly.
 */
export type SettingsScreen = {
  ready: boolean;
  design: DesignId;
  family: DesignFamily;
  expression: MoodExpression;

  level: LevelId;
  chooseLevel: (l: LevelId) => void;
  model: ModelId;
  chooseModel: (m: ModelId) => void;
  topics: TopicId[];
  toggleTopic: (id: TopicId) => void;

  contextChunks: ContextChunk[];
  lastSynced: number;
  removeContext: (id: string) => void;

  docUrl: string;
  setDocUrl: (v: string) => void;
  docLoading: boolean;
  docError: string | null;
  importGoogleDoc: () => void;

  paste: string;
  setPaste: (v: string) => void;
  addPaste: () => void;

  onFile: (f: File | null) => void;

  serverOk: boolean | null;
  resetData: () => void;
};

export function useSettingsScreen(): SettingsScreen {
  const router = useRouter();
  const ready = useScreenReady();
  const onboardingComplete = useSettingsStore((s) => s.onboardingComplete);

  const design = useDesignStore((s) => s.design);
  const expression = useMoodExpression();

  const level = useSettingsStore((s) => s.level);
  const setLevel = useSettingsStore((s) => s.setLevel);
  const preferredModel = useSettingsStore((s) => s.preferredModel);
  const setPreferredModel = useSettingsStore((s) => s.setPreferredModel);
  const selectedTopics = useSettingsStore((s) => s.selectedTopics);
  const setTopics = useSettingsStore((s) => s.setTopics);
  const contextChunks = useSettingsStore((s) => s.contextChunks);

  const [docUrl, setDocUrl] = useState("");
  const [paste, setPaste] = useState("");
  const [docLoading, setDocLoading] = useState(false);
  const [docError, setDocError] = useState<string | null>(null);
  const [serverOk, setServerOk] = useState<boolean | null>(null);

  useEffect(() => {
    if (ready && !onboardingComplete) router.replace(ROUTES.onboarding);
  }, [ready, onboardingComplete, router]);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/health");
        const data = (await res.json()) as { llmConfigured?: boolean };
        setServerOk(Boolean(data.llmConfigured));
      } catch {
        setServerOk(false);
      }
    })();
  }, []);

  const chooseLevel = (l: LevelId) => {
    setLevel(l);
    persistProfile({ level: l });
  };
  const chooseModel = (m: ModelId) => {
    setPreferredModel(m);
    persistProfile({ preferredModel: m });
  };
  const toggleTopic = (id: TopicId) => {
    const next = selectedTopics.includes(id)
      ? selectedTopics.filter((t) => t !== id)
      : [...selectedTopics, id];
    setTopics(next);
    persistProfile({ topics: next });
  };

  const importGoogleDoc = () => {
    void (async () => {
      setDocError(null);
      if (!isLikelyGoogleDocUrl(docUrl)) {
        setDocError("Invalid URL.");
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
          setDocError(data.error ?? "Error");
          return;
        }
        if (data.text) {
          await addContext(data.text, {
            kind: "google_doc",
            url: docUrl.trim(),
            addedAt: Date.now(),
          });
          setDocUrl("");
        }
      } catch {
        setDocError("Network error");
      } finally {
        setDocLoading(false);
      }
    })();
  };

  const addPaste = () => {
    const t = paste.trim();
    if (!t) return;
    void addContext(t, { kind: "pasted", label: "Pasted text", addedAt: Date.now() });
    setPaste("");
  };

  const onFile = (f: File | null) => {
    void (async () => {
      setDocError(null);
      if (!f) return;
      if (!/\.(txt|md)$/i.test(f.name)) {
        setDocError("Only .txt and .md files are supported.");
        return;
      }
      const text = await f.text();
      if (!text.trim()) {
        setDocError("File is empty.");
        return;
      }
      await addContext(text.trim(), { kind: "file", name: f.name, addedAt: Date.now() });
    })();
  };

  const lastSynced = contextChunks.reduce((max, c) => Math.max(max, c.meta.addedAt), 0);

  return {
    ready: ready && onboardingComplete,
    design,
    family: DESIGNS[design].family,
    expression,
    level,
    chooseLevel,
    model: preferredModel,
    chooseModel,
    topics: selectedTopics,
    toggleTopic,
    contextChunks,
    lastSynced,
    removeContext: (id) => void removeContext(id),
    docUrl,
    setDocUrl,
    docLoading,
    docError,
    importGoogleDoc,
    paste,
    setPaste,
    addPaste,
    onFile,
    serverOk,
    resetData: () => {
      void resetUserData();
      router.push(ROUTES.onboarding);
    },
  };
}
