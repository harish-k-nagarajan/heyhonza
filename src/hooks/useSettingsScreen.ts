"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { endChatSessionAction } from "@/lib/client/chat-actions";
import { useMoodExpression } from "@/hooks/useMoodExpression";
import { useScreenReady } from "@/hooks/useScreenReady";
import { isLikelyGoogleDocUrl } from "@/lib/validators";
import {
  addContext,
  persistProfile,
  removeContext,
  resetUserData,
} from "@/lib/client/context-actions";
import {
  ROUTES,
  type DailyMessageCount,
  type LevelId,
  type ModelId,
  type ScheduleMode,
  type TopicId,
} from "@/lib/constants";
import { DESIGNS } from "@/lib/design/registry";
import type { DesignFamily, DesignId } from "@/lib/design/registry";
import type { MoodExpression } from "@/lib/mood/expression";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { useDesignStore } from "@/stores/useDesignStore";
import { useSettingsStore, type FormalityMode } from "@/stores/useSettingsStore";
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
  accountEmail: string;

  level: LevelId;
  chooseLevel: (l: LevelId) => void;
  model: ModelId;
  chooseModel: (m: ModelId) => void;
  topics: TopicId[];
  toggleTopic: (id: TopicId) => void;

  scheduleEnabled: boolean;
  setScheduleEnabled: (enabled: boolean) => void;
  dailyMessageCount: DailyMessageCount;
  setDailyMessageCount: (count: DailyMessageCount) => void;
  scheduleMode: ScheduleMode;
  setScheduleMode: (mode: ScheduleMode) => void;
  firstMessageTime: string;
  setFirstMessageTime: (time: string) => void;

  formality: FormalityMode;
  setFormality: (mode: FormalityMode) => void;

  contextChunks: ContextChunk[];
  lastSynced: number;
  removeContext: (id: string) => void;
  hasGoogleDoc: boolean;

  docUrl: string;
  setDocUrl: (v: string) => void;
  docLoading: boolean;
  docError: string | null;
  importGoogleDoc: () => void;

  paste: string;
  setPaste: (v: string) => void;
  addPaste: () => void;

  onFile: (f: File | null) => void;
  uploadedFileName: string | null;

  llmOk: boolean | null;
  ttsOk: boolean | null;
  resetData: () => void;
  resetChat: () => void;
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
  const scheduleEnabled = useSettingsStore((s) => s.scheduleEnabled);
  const setScheduleEnabled = useSettingsStore((s) => s.setScheduleEnabled);
  const dailyMessageCount = useSettingsStore((s) => s.dailyMessageCount);
  const setDailyMessageCount = useSettingsStore((s) => s.setDailyMessageCount);
  const scheduleMode = useSettingsStore((s) => s.scheduleMode);
  const setScheduleMode = useSettingsStore((s) => s.setScheduleMode);
  const firstMessageTime = useSettingsStore((s) => s.firstMessageTime);
  const setFirstMessageTime = useSettingsStore((s) => s.setFirstMessageTime);
  const formality = useSettingsStore((s) => s.formality);
  const setFormality = useSettingsStore((s) => s.setFormality);

  const [docUrl, setDocUrl] = useState("");
  const [paste, setPaste] = useState("");
  const [docLoading, setDocLoading] = useState(false);
  const [docError, setDocError] = useState<string | null>(null);
  const [llmOk, setLlmOk] = useState<boolean | null>(null);
  const [ttsOk, setTtsOk] = useState<boolean | null>(null);
  const [accountEmail, setAccountEmail] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  useEffect(() => {
    if (ready && !onboardingComplete) router.replace(ROUTES.onboarding);
  }, [ready, onboardingComplete, router]);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/health");
        const data = (await res.json()) as {
          llmConfigured?: boolean;
          ttsConfigured?: boolean;
        };
        setLlmOk(Boolean(data.llmConfigured));
        setTtsOk(Boolean(data.ttsConfigured));
      } catch {
        setLlmOk(false);
        setTtsOk(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createSupabaseBrowserClient();
    void supabase.auth.getUser().then(({ data }) => {
      setAccountEmail(data.user?.email ?? "");
    });
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
      setUploadedFileName(f.name);
      await addContext(text.trim(), { kind: "file", name: f.name, addedAt: Date.now() });
    })();
  };

  const lastSynced = contextChunks.reduce((max, c) => Math.max(max, c.meta.addedAt), 0);
  const hasGoogleDoc = contextChunks.some((c) => c.meta.kind === "google_doc");

  const resetChat = useCallback(() => {
    void endChatSessionAction();
  }, []);

  return {
    ready: ready && onboardingComplete,
    design,
    family: DESIGNS[design].family,
    expression,
    accountEmail,
    level,
    chooseLevel,
    model: preferredModel,
    chooseModel,
    topics: selectedTopics,
    toggleTopic,
    scheduleEnabled,
    setScheduleEnabled,
    dailyMessageCount,
    setDailyMessageCount,
    scheduleMode,
    setScheduleMode,
    firstMessageTime,
    setFirstMessageTime,
    formality,
    setFormality,
    contextChunks,
    lastSynced,
    removeContext: (id) => void removeContext(id),
    hasGoogleDoc,
    docUrl,
    setDocUrl,
    docLoading,
    docError,
    importGoogleDoc,
    paste,
    setPaste,
    addPaste,
    onFile,
    uploadedFileName,
    llmOk,
    ttsOk,
    resetData: () => {
      void resetUserData();
      router.push(ROUTES.onboarding);
    },
    resetChat,
  };
}
