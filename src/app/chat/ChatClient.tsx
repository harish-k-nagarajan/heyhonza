"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { Composer } from "@/components/chat/Composer";
import { MessageList } from "@/components/chat/MessageList";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ROUTES } from "@/lib/constants";
import { buildLearnerContextText } from "@/lib/context";
import { useSettingsHydrated } from "@/hooks/useSettingsHydrated";
import { useChatStore } from "@/stores/useChatStore";
import { useSettingsStore } from "@/stores/useSettingsStore";

export default function ChatClient() {
  const router = useRouter();
  const hydrated = useSettingsHydrated();
  const onboardingComplete = useSettingsStore((s) => s.onboardingComplete);
  const preferredModel = useSettingsStore((s) => s.preferredModel);
  const selectedTopics = useSettingsStore((s) => s.selectedTopics);
  const contextChunks = useSettingsStore((s) => s.contextChunks);

  const messages = useChatStore((s) => s.messages);
  const status = useChatStore((s) => s.status);
  const lastError = useChatStore((s) => s.lastError);
  const addUserMessage = useChatStore((s) => s.addUserMessage);
  const addAssistantMessage = useChatStore((s) => s.addAssistantMessage);
  const setStatus = useChatStore((s) => s.setStatus);
  const setError = useChatStore((s) => s.setError);
  const clearThread = useChatStore((s) => s.clearThread);

  const [bootstrapError, setBootstrapError] = useState<string | null>(null);
  const bootstrapLock = useRef(false);

  useEffect(() => {
    if (hydrated && !onboardingComplete) {
      router.replace(ROUTES.onboarding);
    }
  }, [hydrated, onboardingComplete, router]);

  const callChatApi = useCallback(
    async (opts: {
      messages: { role: "user" | "assistant"; content: string }[];
      bootstrap: boolean;
    }) => {
      const learnerContext = buildLearnerContextText(contextChunks);
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: preferredModel,
          topics: selectedTopics,
          learnerContext,
          messages: opts.messages,
          bootstrap: opts.bootstrap,
        }),
      });
      const data = (await res.json()) as { message?: string; error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? "Server error");
      }
      if (!data.message) {
        throw new Error("Empty response");
      }
      return data.message;
    },
    [contextChunks, preferredModel, selectedTopics],
  );

  const runBootstrap = useCallback(async () => {
    if (useChatStore.getState().messages.length > 0) return;
    if (bootstrapLock.current) return;
    bootstrapLock.current = true;
    setBootstrapError(null);
    setStatus("loading");
    setError(null);
    try {
      const reply = await callChatApi({ messages: [], bootstrap: true });
      if (useChatStore.getState().messages.length === 0) {
        addAssistantMessage(reply);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setBootstrapError(msg);
    } finally {
      bootstrapLock.current = false;
      setStatus("idle");
    }
  }, [addAssistantMessage, callChatApi, setError, setStatus]);

  useEffect(() => {
    if (!hydrated || !onboardingComplete) return;
    if (messages.length > 0) return;
    void runBootstrap();
  }, [hydrated, onboardingComplete, messages.length, runBootstrap]);

  const send = useCallback(
    async (text: string) => {
      addUserMessage(text);
      const thread = useChatStore
        .getState()
        .messages.filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

      setStatus("loading");
      setError(null);
      try {
        const reply = await callChatApi({
          messages: thread,
          bootstrap: false,
        });
        addAssistantMessage(reply);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Unknown error";
        setError(msg);
      } finally {
        setStatus("idle");
      }
    },
    [addAssistantMessage, addUserMessage, callChatApi, setError, setStatus],
  );

  if (!hydrated || !onboardingComplete) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  const threadMessages = messages.filter(
    (m) => m.role === "user" || m.role === "assistant",
  );

  return (
    <div className="flex h-[calc(100dvh-7rem)] flex-col gap-3">
      <header className="flex shrink-0 items-center justify-between gap-2">
        <h1 className="text-lg font-semibold">Chat</h1>
        <Button type="button" variant="ghost" className="text-xs" onClick={clearThread}>
          New chat
        </Button>
      </header>

      {bootstrapError ? (
        <Card className="border-accent/40 bg-muted">
          <p className="text-sm text-accent">{bootstrapError}</p>
          <Button
            type="button"
            variant="secondary"
            className="mt-3"
            onClick={() => void runBootstrap()}
          >
            Try again
          </Button>
        </Card>
      ) : null}

      {lastError ? (
        <p className="text-center text-xs text-accent">{lastError}</p>
      ) : null}

      <Card className="flex min-h-0 flex-1 flex-col gap-3 p-3">
        <MessageList messages={threadMessages} />
        <Composer onSend={(t) => void send(t)} disabled={status === "loading"} />
      </Card>
    </div>
  );
}
