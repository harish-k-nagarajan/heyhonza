"use client";

import Link from "next/link";

import { cn } from "@/lib/cn";
import { useLocale } from "@/lib/i18n/useLocale";
import { ROUTES } from "@/lib/constants";
import { DESIGNS } from "@/lib/design/registry";
import { useDesignStore } from "@/stores/useDesignStore";
import type { ChatSessionMeta } from "@/types";

function formatSessionDate(ts: number, locale: string) {
  return new Date(ts).toLocaleDateString(locale === "cs" ? "cs-CZ" : "en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Slide-over drawer listing ended chat sessions.
 */
export function ChatHistoryDrawer({
  open,
  onClose,
  sessions,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  sessions: ChatSessionMeta[];
  onSelect: (sessionId: string) => void;
}) {
  const { locale, t } = useLocale();
  const isHmat = DESIGNS[useDesignStore((s) => s.design)].family === "hmat";

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 mx-auto max-w-app">
      <button
        type="button"
        className="absolute inset-0 bg-foreground/20 backdrop-blur-[2px]"
        aria-label={t.chat.backToChat}
        onClick={onClose}
      />
      <aside
        className={cn(
          "absolute right-0 top-0 flex h-full w-[min(320px,92vw)] flex-col border-l border-border shadow-xl",
          isHmat ? "mat bg-card" : "bg-card",
        )}
        role="dialog"
        aria-labelledby="chat-history-title"
      >
        <header className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2
            id="chat-history-title"
            className={cn(
              "font-sans text-sm uppercase tracking-[0.16em] text-foreground",
              isHmat && "font-display text-[11px] tracking-[0.2em]",
            )}
          >
            {t.chat.historyTitle}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="font-sans text-[11px] uppercase tracking-[0.16em] text-muted-foreground underline"
          >
            {t.chat.backToChat}
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-3">
          {sessions.length === 0 ? (
            <p className="px-2 py-6 text-center font-sans text-sm text-muted-foreground">
              {t.chat.noHistory}
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {sessions.map((session) => (
                <li key={session.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(session.id)}
                    className={cn(
                      "w-full rounded-[16px] border border-border px-3.5 py-3 text-left transition hover:border-accent/40",
                      isHmat && "mat border-0",
                    )}
                  >
                    <p className="font-sans text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                      {formatSessionDate(session.endedAt ?? session.startedAt, locale)}
                    </p>
                    <p className="mt-1 line-clamp-2 font-sans text-sm leading-relaxed text-foreground">
                      {session.preview || "…"}
                    </p>
                    <p className="mt-1 font-sans text-[10px] text-muted-foreground">
                      {t.chat.messageCount(session.messageCount)}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="border-t border-border p-3">
          <Link
            href={ROUTES.chat}
            onClick={onClose}
            className="block text-center font-sans text-[11px] uppercase tracking-[0.16em] text-accent underline"
          >
            {t.chat.backToChat}
          </Link>
        </div>
      </aside>
    </div>
  );
}
