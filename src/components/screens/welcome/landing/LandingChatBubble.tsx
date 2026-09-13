import type { ReactNode } from "react";

import { LANDING_BUBBLE_MAX_BY_INDEX } from "@/components/screens/welcome/landing/landing-demo-conversation";
import { cn } from "@/lib/cn";
import { TYPE } from "@/lib/design/typography";

export function LandingChatBubble({
  role,
  messageIndex,
  children,
  className,
  morphAnchor,
}: {
  role: "honza" | "user";
  /** Index into `LANDING_DEMO_CONVERSATION` — drives shared max-width. */
  messageIndex: number;
  children: ReactNode;
  className?: string;
  /** Scroll-morph measure targets (desktop landing). */
  morphAnchor?: "hero" | "chat";
}) {
  const isUser = role === "user";
  const maxClass =
    LANDING_BUBBLE_MAX_BY_INDEX[messageIndex] ?? LANDING_BUBBLE_MAX_BY_INDEX[0];

  return (
    <div
      data-landing-hero-bubble={morphAnchor === "hero" ? true : undefined}
      data-landing-chat-bubble={morphAnchor === "chat" ? true : undefined}
      className={cn(
        maxClass,
        "rounded-[18px] px-4 py-2.5 text-left text-wrap",
        TYPE.bodySm,
        "leading-snug",
        isUser
          ? "bg-gradient-to-r from-[#3a7bd5] to-[#5a94e8] text-white shadow-[0_2px_8px_rgba(58,123,213,0.18)]"
          : "border border-border bg-white/90 text-foreground",
        className,
      )}
    >
      {children}
    </div>
  );
}
