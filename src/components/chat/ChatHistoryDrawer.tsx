"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

import { cn } from "@/lib/cn";
import { TYPE } from "@/lib/design/typography";
import { useLocale } from "@/lib/i18n/useLocale";
import { ROUTES } from "@/lib/constants";
import { DESIGNS } from "@/lib/design/registry";
import { tapLight } from "@/lib/interaction/haptic";
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
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) closeBtnRef.current?.focus();
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 mx-auto max-w-app">
      <button
        type="button"
        className="absolute inset-0 bg-foreground/20 backdrop-blur-[2px] motion-safe:animate-drawer-backdrop motion-reduce:animate-none"
        aria-label={t.chat.backToChat}
        onClick={onClose}
      />
      <aside
        className={cn(
          "absolute right-0 top-0 flex h-full w-[min(320px,92vw)] flex-col border-l border-border shadow-xl motion-safe:animate-drawer-in motion-reduce:animate-none",
          isHmat ? "mat bg-card" : "bg-card",
        )}
        role="dialog"
        aria-labelledby="chat-history-title"
      >
        <header className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2
            id="chat-history-title"
            className={cn(
              isHmat
                ? cn(TYPE.meta, "uppercase text-foreground")
                : "font-sans text-sm uppercase tracking-[0.16em] text-foreground",
            )}
          >
            {t.chat.historyTitle}
          </h2>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={() => {
              tapLight();
              onClose();
            }}
            className={cn(
              "underline text-muted-foreground",
              isHmat ? TYPE.label : "font-sans text-[11px] uppercase tracking-[0.16em]",
            )}
          >
            {t.chat.backToChat}
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-3">
          {sessions.length === 0 ? (
            <p className={cn("px-2 py-6 text-center", TYPE.subtitle)}>{t.chat.noHistory}</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {sessions.map((session) => (
                <li key={session.id}>
                  <button
                    type="button"
                    onClick={() => {
                      tapLight();
                      onSelect(session.id);
                    }}
                    className={cn(
                      "w-full rounded-[16px] border border-border px-3.5 py-3 text-left transition hover:border-accent/40",
                      isHmat && "mat mat-tilt border-0",
                    )}
                  >
                    <p className={cn(TYPE.meta, "uppercase text-muted-foreground")}>
                      {formatSessionDate(session.endedAt ?? session.startedAt, locale)}
                    </p>
                    <p className={cn("mt-1 line-clamp-2", TYPE.bodySm, "text-foreground")}>
                      {session.preview || "…"}
                    </p>
                    <p className={cn("mt-1", TYPE.helper)}>
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
            className={cn(
              "block text-center underline text-accent",
              isHmat ? TYPE.label : "font-sans text-[11px] uppercase tracking-[0.16em]",
            )}
          >
            {t.chat.backToChat}
          </Link>
        </div>
      </aside>
    </div>
  );
}
