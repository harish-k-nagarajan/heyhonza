"use client";

import { cn } from "@/lib/cn";
import type { ChatMessage } from "@/types";

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <div
      className={cn(
        "flex w-full",
        isUser ? "justify-end" : "justify-start",
      )}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-card px-3 py-2 text-sm leading-relaxed",
          isUser
            ? "bg-accent text-accent-foreground"
            : "border border-border bg-card text-card-foreground",
        )}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
        <time
          className="mt-1 block font-sans text-[9px] opacity-60"
          dateTime={new Date(message.createdAt).toISOString()}
        >
          {new Date(message.createdAt).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </time>
      </div>
    </div>
  );
}
