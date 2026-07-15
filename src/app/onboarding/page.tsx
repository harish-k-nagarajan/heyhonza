"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { HonzaOrb } from "@/components/honza/HonzaOrb";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Textarea } from "@/components/ui/Textarea";
import { LEVEL_OPTIONS, ROUTES, TOPIC_OPTIONS } from "@/lib/constants";
import { isLikelyGoogleDocUrl } from "@/lib/validators";
import { addContext, persistProfile } from "@/lib/client/context-actions";
import { useSettingsHydrated } from "@/hooks/useSettingsHydrated";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { useSyncStore } from "@/stores/useSyncStore";
import type { LevelId, TopicId } from "@/lib/constants";

export default function OnboardingPage() {
  const router = useRouter();
  const localHydrated = useSettingsHydrated();
  const serverChecked = useSyncStore((s) => s.checked);
  const hydrated = localHydrated && serverChecked;
  const onboardingComplete = useSettingsStore((s) => s.onboardingComplete);
  const setOnboardingComplete = useSettingsStore((s) => s.setOnboardingComplete);
  const selectedTopics = useSettingsStore((s) => s.selectedTopics);
  const setTopics = useSettingsStore((s) => s.setTopics);
  const level = useSettingsStore((s) => s.level);
  const setLevel = useSettingsStore((s) => s.setLevel);

  const [docUrl, setDocUrl] = useState("");
  const [paste, setPaste] = useState("");
  const [docLoading, setDocLoading] = useState(false);
  const [docError, setDocError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  useEffect(() => {
    if (hydrated && onboardingComplete) {
      router.replace(ROUTES.home);
    }
  }, [hydrated, onboardingComplete, router]);

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

  const importGoogleDoc = async () => {
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
  };

  const onFile = async (f: File | null) => {
    setFileError(null);
    if (!f) return;
    const ok = /\.(txt|md)$/i.test(f.name);
    if (!ok) {
      setFileError("Only .txt and .md files are supported for now.");
      return;
    }
    const text = await f.text();
    if (!text.trim()) {
      setFileError("File is empty.");
      return;
    }
    await addContext(text.trim(), {
      kind: "file",
      name: f.name,
      addedAt: Date.now(),
    });
  };

  const addPaste = () => {
    setFileError(null);
    const t = paste.trim();
    if (!t) {
      setFileError("Paste some text.");
      return;
    }
    void addContext(t, {
      kind: "pasted",
      label: "Pasted text",
      addedAt: Date.now(),
    });
    setPaste("");
  };

  if (!hydrated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (onboardingComplete) {
    return null;
  }

  return (
    <div className="mx-auto flex max-w-app flex-col gap-6">
      <header className="flex flex-col items-center gap-4 text-center">
        <HonzaOrb state="idle" size="avatar" />
        <SectionLabel as="p">WELCOME</SectionLabel>
        <h1 className="text-2xl font-semibold tracking-tight">Ahoj! I&apos;m Honza</h1>
        <p className="text-sm text-muted-foreground">
          The API key stays on the server (Vercel env). Choose topics and context—
          then Honza will message you in Czech in the chat.
        </p>
      </header>

      <Card className="space-y-3">
        <SectionLabel>Your Czech level</SectionLabel>
        <p className="text-xs text-muted-foreground">
          Honza scales vocabulary and corrections to this.
        </p>
        <div className="flex flex-wrap gap-2">
          {LEVEL_OPTIONS.map((l) => {
            const on = level === l.id;
            return (
              <button
                key={l.id}
                type="button"
                onClick={() => chooseLevel(l.id as LevelId)}
                aria-pressed={on}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  on
                    ? "border-accent bg-accent/15 text-accent"
                    : "border-border bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {l.label}
              </button>
            );
          })}
        </div>
      </Card>

      <Card className="space-y-3">
        <SectionLabel>Topics</SectionLabel>
        <p className="text-xs text-muted-foreground">
          Pick areas you care about.
        </p>
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
                    : "border-border bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </Card>

      <Card className="space-y-3">
        <SectionLabel>Context · Google Doc</SectionLabel>
        <p className="text-xs text-muted-foreground">
          The doc must be public: Share → Anyone with the link → Viewer. The
          server downloads plain text (no OAuth).
        </p>
        <Label htmlFor="doc-url">Document URL</Label>
        <Input
          id="doc-url"
          value={docUrl}
          onChange={(e) => setDocUrl(e.target.value)}
          placeholder="https://docs.google.com/document/d/…"
        />
        {docError ? (
          <p className="text-xs text-accent">{docError}</p>
        ) : null}
        <Button
          type="button"
          variant="secondary"
          disabled={docLoading}
          onClick={() => void importGoogleDoc()}
        >
          {docLoading ? "Fetching…" : "Import document"}
        </Button>
      </Card>

      <Card className="space-y-3">
        <SectionLabel>File or pasted text</SectionLabel>
        <Label htmlFor="file">File (.txt, .md)</Label>
        <Input
          id="file"
          type="file"
          accept=".txt,.md,text/plain"
          onChange={(e) => void onFile(e.target.files?.[0] ?? null)}
        />
        <Label htmlFor="paste">Or paste text</Label>
        <Textarea
          id="paste"
          value={paste}
          onChange={(e) => setPaste(e.target.value)}
          placeholder="Anything Honza should know about you…"
          rows={4}
        />
        {fileError ? (
          <p className="text-xs text-accent">{fileError}</p>
        ) : null}
        <Button type="button" variant="secondary" onClick={addPaste}>
          Add pasted text
        </Button>
      </Card>

      <Button
        type="button"
        className="w-full"
        onClick={() => {
          setOnboardingComplete(true);
          // Persist the full onboarding payload as one data model (Phase 6):
          // onboarding flag + the same Settings fields (topics, level).
          persistProfile({
            onboardingCompleted: true,
            topics: selectedTopics,
            level,
          });
          router.push(ROUTES.home);
        }}
      >
        Continue to app
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Already set up?{" "}
        <Link href={ROUTES.settings} className="text-accent underline">
          Settings
        </Link>
      </p>
    </div>
  );
}
