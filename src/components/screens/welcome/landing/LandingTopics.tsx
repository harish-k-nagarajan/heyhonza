"use client";

import {
  LANDING_TOPIC_ANSWERS,
  LANDING_TOPIC_QUESTIONS,
} from "@/components/screens/welcome/welcome-content";
import { cn } from "@/lib/cn";
import { TYPE } from "@/lib/design/typography";
import { useLocale } from "@/lib/i18n/useLocale";

import { LandingFoldHeader } from "./LandingFoldHeader";

function TickerChip({
  children,
  variant,
}: {
  children: string;
  variant: "question" | "answer";
}) {
  const isAnswer = variant === "answer";

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-2 rounded-full px-[18px] py-2.5",
        TYPE.bodySm,
        isAnswer
          ? "bg-gradient-to-r from-[#3a7bd5] to-[#5a94e8] text-white shadow-[0_2px_8px_rgba(58,123,213,0.18)]"
          : "border border-border bg-white text-foreground",
      )}
    >
      {!isAnswer ? (
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
      ) : null}
      {children}
    </span>
  );
}

function TickerRow({
  items,
  variant,
  direction,
}: {
  items: readonly string[];
  variant: "question" | "answer";
  direction: "left" | "right";
}) {
  const track = [...items, ...items];

  return (
    <div className="landing-ticker-row relative overflow-hidden">
      <div
        className={cn(
          "landing-ticker-track flex w-max gap-3",
          direction === "left" ? "landing-ticker-left" : "landing-ticker-right",
        )}
      >
        {track.map((item, index) => (
          <TickerChip key={`${item}-${index}`} variant={variant}>
            {item}
          </TickerChip>
        ))}
      </div>
      <div className="landing-ticker-fade-left pointer-events-none absolute inset-y-0 left-0 w-16" />
      <div className="landing-ticker-fade-right pointer-events-none absolute inset-y-0 right-0 w-16" />
    </div>
  );
}

export function LandingTopics() {
  const { t } = useLocale();
  const w = t.welcome;

  return (
    <section className="flex flex-col gap-5 px-6 md:px-10">
      <LandingFoldHeader
        kicker={w.sectionTopicsKicker}
        title={w.sectionTopicsTitle}
        lead={w.sectionTopicsLead}
        className="items-start text-left"
      />

      <div className="flex flex-col gap-2.5">
        <TickerRow items={LANDING_TOPIC_QUESTIONS} variant="question" direction="left" />
        <TickerRow items={LANDING_TOPIC_ANSWERS} variant="answer" direction="right" />
      </div>

      <div className="flex flex-wrap items-center gap-5 pt-1">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
          <span className={cn(TYPE.helper, "text-[#5C534D]")}>{w.honzaAsks}</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#3a7bd5]" aria-hidden />
          <span className={cn(TYPE.helper, "text-[#5C534D]")}>{w.youReply}</span>
        </span>
      </div>
    </section>
  );
}
