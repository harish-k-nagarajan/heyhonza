"use client";

import {
  LANDING_PHONE_CHAT,
} from "@/components/screens/welcome/welcome-content";
import { cn } from "@/lib/cn";
import { TYPE } from "@/lib/design/typography";
import { useLocale } from "@/lib/i18n/useLocale";

import { LandingChatBubble } from "./LandingChatBubble";
import { LandingFoldHeader } from "./LandingFoldHeader";

export function LandingChatFold() {
  const { t } = useLocale();
  const w = t.welcome;

  return (
    <section
      className={cn(
        "landing-fold landing-fold-chat relative flex flex-col items-center gap-8 px-6 py-12 md:px-10 md:py-14",
        "before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:hidden before:h-24 before:bg-gradient-to-b before:from-[#fff4ee] before:via-white/80 before:to-transparent md:before:block",
      )}
    >
      <LandingFoldHeader
        num="01"
        kicker={w.sectionChatKicker}
        title={w.sectionChatTitle}
      />

      <div
        data-landing-phone
        className={cn(
          "landing-phone-frame w-full max-w-[390px] rounded-[28px] border border-border",
          "bg-white/80 p-5 shadow-[0_12px_32px_rgba(120,90,70,0.09)] backdrop-blur-[16px]",
          "md:sticky md:top-[10vh] md:z-[5]",
        )}
      >
        <div className="mb-3 flex items-center justify-between">
          <p className={cn(TYPE.title, "text-base text-foreground")}>{t.common.honza}</p>
          <p className={cn(TYPE.bodySm, "text-[#2E7D32]")}>{w.online}</p>
        </div>

        <div className="flex flex-col gap-2.5 py-2">
          {LANDING_PHONE_CHAT.map((message, index) => (
            <div
              key={message.text}
              data-landing-chat-slot={index}
              className={cn(
                "flex w-full",
                message.role === "user" ? "justify-end" : "justify-start",
              )}
            >
              <LandingChatBubble
                role={message.role}
                messageIndex={index}
                morphAnchor="chat"
              >
                {message.text}
              </LandingChatBubble>
            </div>
          ))}
        </div>
      </div>

      <p className={cn("max-w-[480px] text-center", TYPE.subtitle, "md:text-[14px]")}>
        {w.sectionChatLead}
      </p>
    </section>
  );
}
