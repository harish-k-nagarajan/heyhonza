"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useMoodExpression } from "@/hooks/useMoodExpression";
import { rememberProviderStatusFromResponse } from "@/hooks/useProviderStatus";
import { useNeedsOnboarding, useScreenReady } from "@/hooks/useScreenReady";
import { explainPushFailure } from "@/lib/i18n/locales";
import { useLocale } from "@/lib/i18n/useLocale";
import { isLikelyGoogleDocUrl } from "@/lib/validators";
import {
  persistProfile,
  removeContext,
  resetUserData,
  upsertContext,
} from "@/lib/client/context-actions";
import {
  canonicalizeModelId,
  ROUTES,
  type DailyMessageCount,
  type FormalityMode,
  type LevelId,
  type ModelId,
  type ScheduleMode,
  type TopicId,
} from "@/lib/constants";
import { DESIGNS } from "@/lib/design/registry";
import type { DesignFamily, DesignId } from "@/lib/design/registry";
import type { MoodExpression } from "@/lib/mood/expression";
import {
  pushSupport,
  sendTestPush as requestTestPush,
  subscribeToPush,
  unsubscribeFromPush,
  type PushSupport,
} from "@/lib/push/client";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { useDesignStore } from "@/stores/useDesignStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import type { ContextChunk } from "@/types";

export type ProviderUiStatus = {
  source: "none" | "env" | "user";
  connected: boolean;
};

export type SettingsScreen = {
  ready: boolean;
  design: DesignId;
  family: DesignFamily;
  expression: MoodExpression;
  accountEmail: string;
  accountName: string;
  accountFullName: string;
  authConfigured: boolean;

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
  pushHint: string | null;
  pushSupport: PushSupport;
  sendTestPush: () => void;
  testPushBusy: boolean;

  formality: FormalityMode;
  setFormality: (mode: FormalityMode) => void;

  contextChunks: ContextChunk[];
  lastSynced: number;
  removeContext: (id: string) => void;

  paste: string;
  setPaste: (v: string) => void;
  pasteLoaded: boolean;
  savePaste: () => void;

  docUrl: string;
  setDocUrl: (v: string) => void;
  docLoading: boolean;
  docError: string | null;
  docConnected: boolean;
  importGoogleDoc: () => void;
  disconnectGoogleDoc: () => void;

  onFile: (f: File | null) => void;
  fileName: string | null;
  disconnectFile: () => void;

  llm: ProviderUiStatus | null;
  tts: ProviderUiStatus | null;
  providerBusy: boolean;
  saveProviderKey: (provider: "openrouter" | "elevenlabs", key: string) => Promise<string | null>;
  disconnectProvider: (provider: "openrouter" | "elevenlabs") => Promise<void>;

  resetData: () => void;
};

function detectTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

export function useSettingsScreen(): SettingsScreen {
  const router = useRouter();
  const ready = useScreenReady();
  const needsOnboarding = useNeedsOnboarding();
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
  const setScheduleEnabledStore = useSettingsStore((s) => s.setScheduleEnabled);
  const dailyMessageCount = useSettingsStore((s) => s.dailyMessageCount);
  const setDailyMessageCountStore = useSettingsStore((s) => s.setDailyMessageCount);
  const scheduleMode = useSettingsStore((s) => s.scheduleMode);
  const setScheduleModeStore = useSettingsStore((s) => s.setScheduleMode);
  const firstMessageTime = useSettingsStore((s) => s.firstMessageTime);
  const setFirstMessageTimeStore = useSettingsStore((s) => s.setFirstMessageTime);
  const formality = useSettingsStore((s) => s.formality);
  const setFormalityStore = useSettingsStore((s) => s.setFormality);
  const learnerName = useSettingsStore((s) => s.learnerName);
  const fullName = useSettingsStore((s) => s.fullName);
  const setTimezone = useSettingsStore((s) => s.setTimezone);

  const [docUrlDraft, setDocUrlDraft] = useState<string | null>(null);
  const [pasteDraft, setPasteDraft] = useState<string | null>(null);
  const [pasteTouched, setPasteTouched] = useState(false);
  const [docLoading, setDocLoading] = useState(false);
  const [docError, setDocError] = useState<string | null>(null);
  const [llm, setLlm] = useState<ProviderUiStatus | null>(null);
  const [tts, setTts] = useState<ProviderUiStatus | null>(null);
  const [providerBusy, setProviderBusy] = useState(false);
  const [accountEmail, setAccountEmail] = useState("");
  const [pushHint, setPushHint] = useState<string | null>(null);
  const [testPushBusy, setTestPushBusy] = useState(false);
  const [support] = useState<PushSupport>(() =>
    typeof window === "undefined" ? "unsupported" : pushSupport(),
  );
  const { t } = useLocale();
  const settingsCopy = t.settings;

  const pastedChunk = useMemo(
    () => contextChunks.find((c) => c.meta.kind === "pasted") ?? null,
    [contextChunks],
  );
  const docChunk = useMemo(
    () => contextChunks.find((c) => c.meta.kind === "google_doc") ?? null,
    [contextChunks],
  );
  const fileChunk = useMemo(
    () => contextChunks.find((c) => c.meta.kind === "file") ?? null,
    [contextChunks],
  );

  const storedDocUrl = docChunk?.meta.kind === "google_doc" ? docChunk.meta.url : "";
  const docUrl = docUrlDraft ?? storedDocUrl;
  const setDocUrl = (v: string) => setDocUrlDraft(v);
  const paste = pasteTouched ? (pasteDraft ?? "") : (pastedChunk?.text ?? pasteDraft ?? "");
  const setPaste = (v: string) => {
    setPasteTouched(true);
    setPasteDraft(v);
  };

  useEffect(() => {
    if (needsOnboarding) router.replace(ROUTES.onboarding);
  }, [needsOnboarding, router]);

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
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createSupabaseBrowserClient();
    void supabase.auth.getUser().then(({ data }) => {
      setAccountEmail(data.user?.email ?? "");
    });
  }, []);

  const schedulePatch = useCallback(
    async (extra: {
      scheduleEnabled?: boolean;
      dailyMessageCount?: DailyMessageCount;
      scheduleMode?: ScheduleMode;
      firstMessageTime?: string;
    }) => {
      const tz = detectTimezone();
      setTimezone(tz);
      await persistProfile({
        timezone: tz,
        scheduleEnabled,
        dailyMessageCount,
        scheduleMode,
        firstMessageTime,
        ...extra,
      });
    },
    [
      dailyMessageCount,
      firstMessageTime,
      scheduleEnabled,
      scheduleMode,
      setTimezone,
    ],
  );

  const chooseLevel = (l: LevelId) => {
    setLevel(l);
    persistProfile({ level: l });
  };
  const chooseModel = (m: ModelId) => {
    const id = canonicalizeModelId(m);
    setPreferredModel(id);
    persistProfile({ preferredModel: id });
  };
  const toggleTopic = (id: TopicId) => {
    const next = selectedTopics.includes(id)
      ? selectedTopics.filter((t) => t !== id)
      : [...selectedTopics, id];
    setTopics(next);
    persistProfile({ topics: next });
  };

  const setFormality = (mode: FormalityMode) => {
    setFormalityStore(mode);
    persistProfile({ formality: mode });
  };

  const setDailyMessageCount = (count: DailyMessageCount) => {
    setDailyMessageCountStore(count);
    void schedulePatch({ dailyMessageCount: count });
  };
  const setScheduleMode = (mode: ScheduleMode) => {
    setScheduleModeStore(mode);
    void schedulePatch({ scheduleMode: mode });
  };
  const setFirstMessageTime = (time: string) => {
    setFirstMessageTimeStore(time);
    void schedulePatch({ firstMessageTime: time });
  };

  useEffect(() => {
    if (!ready || !scheduleEnabled) return;
    let cancelled = false;
    void subscribeToPush().then((result) => {
      if (cancelled || result.ok) return;
      setPushHint(explainPushFailure(result.reason, settingsCopy));
    });
    return () => {
      cancelled = true;
    };
  }, [ready, scheduleEnabled, settingsCopy]);

  const setScheduleEnabled = (enabled: boolean) => {
    void (async () => {
      setScheduleEnabledStore(enabled);
      await schedulePatch({ scheduleEnabled: enabled });
      setPushHint(null);
      if (!enabled) {
        await unsubscribeFromPush();
        return;
      }
      const result = await subscribeToPush();
      if (!result.ok) {
        setPushHint(explainPushFailure(result.reason, settingsCopy));
      }
    })();
  };

  const sendTestPush = () => {
    void (async () => {
      setTestPushBusy(true);
      setPushHint(null);
      try {
        const result = await requestTestPush();
        setPushHint(
          result.ok
            ? settingsCopy.notificationsTestSent
            : explainPushFailure(result.reason, settingsCopy),
        );
      } finally {
        setTestPushBusy(false);
      }
    })();
  };

  const importGoogleDoc = () => {
    void (async () => {
      setDocError(null);
      if (!isLikelyGoogleDocUrl(docUrl)) {
        setDocError("That doesn’t look like a public Google Doc link.");
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
          setDocError(data.error ?? "Couldn’t load that document. Check the link.");
          return;
        }
        if (data.text) {
          await upsertContext(data.text, {
            kind: "google_doc",
            url: docUrl.trim(),
            addedAt: Date.now(),
          });
        }
      } catch {
        setDocError("Network error — try again.");
      } finally {
        setDocLoading(false);
      }
    })();
  };

  const savePaste = () => {
    const t = paste.trim();
    if (!t) {
      if (pastedChunk) void removeContext(pastedChunk.id);
      return;
    }
    void upsertContext(t, { kind: "pasted", label: "Pasted text", addedAt: Date.now() });
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
      await upsertContext(text.trim(), { kind: "file", name: f.name, addedAt: Date.now() });
    })();
  };

  const lastSynced = contextChunks.reduce((max, c) => Math.max(max, c.meta.addedAt), 0);

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

  return {
    ready: ready && onboardingComplete,
    design,
    family: DESIGNS[design].family,
    expression,
    accountEmail,
    accountName: learnerName,
    accountFullName: fullName,
    authConfigured: isSupabaseConfigured(),
    level,
    chooseLevel,
    model: canonicalizeModelId(preferredModel),
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
    pushHint,
    pushSupport: support,
    sendTestPush,
    testPushBusy,
    formality,
    setFormality,
    contextChunks,
    lastSynced,
    removeContext: (id) => void removeContext(id),
    paste,
    setPaste,
    pasteLoaded: Boolean(pastedChunk),
    savePaste,
    docUrl,
    setDocUrl,
    docLoading,
    docError,
    docConnected: Boolean(docChunk) && !docError,
    importGoogleDoc,
    disconnectGoogleDoc: () => {
      if (docChunk) void removeContext(docChunk.id);
      setDocUrl("");
      setDocError(null);
    },
    onFile,
    fileName: fileChunk?.meta.kind === "file" ? fileChunk.meta.name : null,
    disconnectFile: () => {
      if (fileChunk) void removeContext(fileChunk.id);
    },
    llm,
    tts,
    providerBusy,
    saveProviderKey,
    disconnectProvider,
    resetData: () => {
      void resetUserData();
      router.push(ROUTES.onboarding);
    },
  };
}
