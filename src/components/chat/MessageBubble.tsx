"use client";

import { cn } from "@/lib/cn";
import { TYPE } from "@/lib/design/typography";
import type { ChatMessage } from "@/types";

export function MessageBubble({
  message,
  index = 0,
}: {
  message: ChatMessage;
  index?: number;
}) {
  const isUser = message.role === "user";
  const delay = Math.min(index, 3) * 50;

  return (
    <div
      className={cn(
        "message-enter flex w-full motion-reduce:opacity-100",
        isUser ? "justify-end" : "justify-start",
      )}
      style={delay > 0 ? { transitionDelay: `${delay}ms, 0ms` } : undefined}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-card px-3 py-2",
          TYPE.bodySm,
          isUser
            ? "bg-accent text-accent-foreground"
            : "border border-border bg-card text-accent",
        )}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
        <time
          className={cn("mt-1 block opacity-60", TYPE.kicker)}
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
