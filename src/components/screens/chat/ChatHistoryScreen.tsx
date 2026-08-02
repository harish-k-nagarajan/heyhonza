"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { MessageList } from "@/components/chat/MessageList";
import { HmatOrb } from "@/components/honza/HmatOrb";
import { HonzaOrb } from "@/components/honza/HonzaOrb";
import { fetchSessionMessages } from "@/lib/client/chat-actions";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/cn";
import { TYPE } from "@/lib/design/typography";
import { useLocale } from "@/lib/i18n/useLocale";
import { DESIGNS } from "@/lib/design/registry";
import { useDesignStore } from "@/stores/useDesignStore";
import { useChatStore } from "@/stores/useChatStore";
import type { ChatMessage } from "@/types";

function HmatBubble({ message }: { message: ChatMessage }) {
  const me = message.role === "user";
  if (me) {
    return (
      <div
        className="max-w-[82%] self-end px-3.5 py-2.5"
        style={{
          borderRadius: "16px 16px 5px 16px",
          background:
            "linear-gradient(180deg, color-mix(in srgb, var(--accent) 96%, #fff), var(--accent))",
          color: "#fff",
        }}
      >
        <p className={TYPE.bodySm}>{message.content}</p>
      </div>
    );
  }
  return (
    <div className="mat max-w-[82%] self-start px-3.5 py-2.5" style={{ borderRadius: "16px 16px 16px 5px" }}>
      <p className={cn(TYPE.bodySm, "text-foreground")}>{message.content}</p>
    </div>
  );
}

export function ChatHistoryScreen() {
  const params = useParams<{ id: string }>();
  const sessionId = params.id;
  const { t, locale } = useLocale();
  const design = useDesignStore((s) => s.design);
  const isHmat = DESIGNS[design].family === "hmat";
  const archived = useChatStore((s) => s.archivedMessages[sessionId]);
  const sessionMeta = useChatStore((s) =>
    s.endedSessions.find((x) => x.id === sessionId),
  );
  const [messages, setMessages] = useState<ChatMessage[]>(archived ?? []);
  const [loading, setLoading] = useState(!archived?.length);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (archived?.length) {
        setMessages(archived);
        setLoading(false);
        return;
      }
      const remote = await fetchSessionMessages(sessionId);
      if (cancelled) return;
      if (remote?.length) {
        useChatStore.getState().setArchivedSessionMessages(sessionId, remote);
        setMessages(remote);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [archived, sessionId]);

  const dateLabel = sessionMeta
    ? new Date(sessionMeta.endedAt ?? sessionMeta.startedAt).toLocaleDateString(
        locale === "cs" ? "cs-CZ" : "en-US",
        { month: "long", day: "numeric", year: "numeric" },
      )
    : "";

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <header className="flex shrink-0 items-center justify-between gap-3">
        <Link
          href={ROUTES.chat}
          className={cn(TYPE.meta, "uppercase text-muted-foreground underline")}
        >
          {t.chat.backToChat}
        </Link>
        {dateLabel ? (
          <span className={cn(TYPE.label, "text-muted-foreground")}>{dateLabel}</span>
        ) : null}
      </header>

      <div className="flex shrink-0 flex-col items-center gap-2 py-2">
        {isHmat ? (
          <HmatOrb state="idle" size={64} breathe={false} />
        ) : (
          <HonzaOrb state="idle" size="avatar" />
        )}
        <p className={TYPE.helper}>{t.chat.transcript}</p>
      </div>

      <div className={isHmat ? "mat flex min-h-0 flex-1 flex-col overflow-y-auto p-3" : "flex min-h-0 flex-1 flex-col overflow-y-auto rounded-card border border-border bg-card p-3"}>
        {loading ? (
          <p className={cn("py-8 text-center", TYPE.subtitle)}>…</p>
        ) : messages.length === 0 ? (
          <p className={cn("py-8 text-center", TYPE.subtitle)}>{t.chat.noHistory}</p>
        ) : isHmat ? (
          <div className="flex flex-col gap-2.5">
            {messages.map((m) => (
              <HmatBubble key={m.id} message={m} />
            ))}
          </div>
        ) : (
          <MessageList messages={messages} />
        )}
      </div>
    </div>
  );
}
