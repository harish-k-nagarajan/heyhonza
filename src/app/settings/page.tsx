"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Textarea } from "@/components/ui/Textarea";
import {
  LEVEL_OPTIONS,
  MODEL_OPTIONS,
  ROUTES,
  TOPIC_OPTIONS,
} from "@/lib/constants";
import { isLikelyGoogleDocUrl } from "@/lib/validators";
import { useSettingsHydrated } from "@/hooks/useSettingsHydrated";
import { useChatStore } from "@/stores/useChatStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import type { LevelId, ModelId, TopicId } from "@/lib/constants";

export default function SettingsPage() {
  const router = useRouter();
  const hydrated = useSettingsHydrated();
  const onboardingComplete = useSettingsStore((s) => s.onboardingComplete);
  const preferredModel = useSettingsStore((s) => s.preferredModel);
  const setPreferredModel = useSettingsStore((s) => s.setPreferredModel);
  const level = useSettingsStore((s) => s.level);
  const setLevel = useSettingsStore((s) => s.setLevel);
  const selectedTopics = useSettingsStore((s) => s.selectedTopics);
  const setTopics = useSettingsStore((s) => s.setTopics);
  const contextChunks = useSettingsStore((s) => s.contextChunks);
  const removeContextChunk = useSettingsStore((s) => s.removeContextChunk);
  const addContextChunk = useSettingsStore((s) => s.addContextChunk);
  const reset = useSettingsStore((s) => s.reset);
  const clearThread = useChatStore((s) => s.clearThread);

  const [docUrl, setDocUrl] = useState("");
  const [paste, setPaste] = useState("");
  const [docLoading, setDocLoading] = useState(false);
  const [docError, setDocError] = useState<string | null>(null);
  const [serverOk, setServerOk] = useState<boolean | null>(null);

  useEffect(() => {
    if (hydrated && !onboardingComplete) {
      router.replace(ROUTES.onboarding);
    }
  }, [hydrated, onboardingComplete, router]);

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

  const toggleTopic = (id: TopicId) => {
    setTopics(
      selectedTopics.includes(id)
        ? selectedTopics.filter((t) => t !== id)
        : [...selectedTopics, id],
    );
  };

  const importGoogleDoc = async () => {
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
        const stamp = Date.now();
        addContextChunk(data.text, {
          kind: "google_doc",
          url: docUrl.trim(),
          addedAt: stamp,
        });
        setDocUrl("");
      }
    } catch {
      setDocError("Network error");
    } finally {
      setDocLoading(false);
    }
  };

  const addPaste = () => {
    const t = paste.trim();
    if (!t) return;
    addContextChunk(t, {
      kind: "pasted",
      label: "Pasted text",
      addedAt: Date.now(),
    });
    setPaste("");
  };

  const onFile = async (f: File | null) => {
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
    addContextChunk(text.trim(), {
      kind: "file",
      name: f.name,
      addedAt: Date.now(),
    });
  };

  if (!hydrated || !onboardingComplete) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-app flex-col gap-6">
      <header className="space-y-2">
        <SectionLabel as="p">Settings</SectionLabel>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          API keys live on the server (Vercel). The client never stores them.
        </p>
      </header>

      <Card className="space-y-2">
        <SectionLabel>Server status</SectionLabel>
        <p className="text-sm text-muted-foreground">
          OpenRouter env on server:{" "}
          {serverOk === null
            ? "…"
            : serverOk
              ? "configured"
              : "missing OPENROUTER_API_KEY"}
        </p>
      </Card>

      <Card className="space-y-3">
        <SectionLabel>Czech level</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {LEVEL_OPTIONS.map((l) => {
            const on = level === l.id;
            return (
              <button
                key={l.id}
                type="button"
                onClick={() => setLevel(l.id as LevelId)}
                aria-pressed={on}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  on
                    ? "border-accent bg-accent/15 text-accent"
                    : "border-border bg-muted text-muted-foreground"
                }`}
              >
                {l.label}
              </button>
            );
          })}
        </div>
      </Card>

      <Card className="space-y-3">
        <SectionLabel>Model</SectionLabel>
        <Label htmlFor="model" className="sr-only">
          Model
        </Label>
        <select
          id="model"
          className="h-11 w-full rounded-card border border-border bg-muted px-3 text-sm text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/40"
          value={preferredModel}
          onChange={(e) => setPreferredModel(e.target.value as ModelId)}
        >
          {MODEL_OPTIONS.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label}
            </option>
          ))}
        </select>
      </Card>

      <Card className="space-y-3">
        <SectionLabel>Topics</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {TOPIC_OPTIONS.map((t) => {
            const on = selectedTopics.includes(t.id);
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => toggleTopic(t.id)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  on
                    ? "border-accent bg-accent/15 text-accent"
                    : "border-border bg-muted text-muted-foreground"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </Card>

      <Card className="space-y-3">
        <SectionLabel>Context documents</SectionLabel>
        <Label htmlFor="s-doc">Google Doc (public link)</Label>
        <Input
          id="s-doc"
          value={docUrl}
          onChange={(e) => setDocUrl(e.target.value)}
          placeholder="https://docs.google.com/document/d/…"
        />
        {docError ? <p className="text-xs text-accent">{docError}</p> : null}
        <Button
          type="button"
          variant="secondary"
          disabled={docLoading}
          onClick={() => void importGoogleDoc()}
        >
          {docLoading ? "Fetching…" : "Add from Google Docs"}
        </Button>
        <Label htmlFor="s-paste">Pasted text</Label>
        <Textarea
          id="s-paste"
          value={paste}
          onChange={(e) => setPaste(e.target.value)}
          rows={3}
        />
        <Button type="button" variant="secondary" onClick={addPaste}>
          Add text
        </Button>
        <Label htmlFor="s-file">File (.txt, .md)</Label>
        <Input
          id="s-file"
          type="file"
          accept=".txt,.md,text/plain"
          onChange={(e) => void onFile(e.target.files?.[0] ?? null)}
        />
        <ul className="space-y-2">
          {contextChunks.map((c) => (
            <li
              key={c.id}
              className="flex items-start justify-between gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs"
            >
              <div className="min-w-0">
                <p className="font-medium text-foreground">
                  {c.meta.kind === "google_doc"
                    ? "Google Doc"
                    : c.meta.kind === "file"
                      ? c.meta.name
                      : c.meta.label}
                </p>
                <p className="line-clamp-2 text-muted-foreground">{c.text}</p>
              </div>
              <button
                type="button"
                className="shrink-0 text-accent underline"
                onClick={() => removeContextChunk(c.id)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="space-y-3">
        <SectionLabel>Device data</SectionLabel>
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            clearThread();
            reset();
            router.push(ROUTES.onboarding);
          }}
        >
          Reset data and run onboarding again
        </Button>
      </Card>
    </div>
  );
}
