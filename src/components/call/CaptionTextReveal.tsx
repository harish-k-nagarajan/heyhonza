"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/cn";
import { TYPE } from "@/lib/design/typography";

/**
 * Word-by-word caption reveal (skiper70-style) for live call transcripts.
 */
export function CaptionTextReveal({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const reducedMotion = useReducedMotion();
  const words = useMemo(() => text.trim().split(/\s+/).filter(Boolean), [text]);

  if (reducedMotion) {
    return <span className={cn(TYPE.bodySm, className)}>{text}</span>;
  }

  return (
    <span className={cn(TYPE.bodySm, className)}>
      {words.map((word, i) => (
        <motion.span
          key={`${i}-${word}`}
          initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{
            delay: i * 0.055,
            duration: 0.38,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="relative mr-[0.28em] inline-block last:mr-0"
        >
          <motion.span
            className="absolute inset-x-[-2px] bottom-[1px] h-[55%] rounded-sm bg-[#3f6b4a]/12"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{
              delay: i * 0.055 + 0.04,
              duration: 0.32,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{ transformOrigin: "left center" }}
            aria-hidden
          />
          <span className="relative">{word}</span>
        </motion.span>
      ))}
    </span>
  );
}
