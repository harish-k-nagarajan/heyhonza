"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/cn";
import { TYPE } from "@/lib/design/typography";

const WORD_GAP_MS = 55;

/**
 * Live call captions: words enter one by one and the viewport stays a
 * fixed height, pinning to the newest line so older text rolls up.
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
  const [shown, setShown] = useState(1);
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reducedMotion || words.length <= 1) return;
    let n = 1;
    const id = window.setInterval(() => {
      n += 1;
      setShown(n);
      if (n >= words.length) window.clearInterval(id);
    }, WORD_GAP_MS);
    return () => window.clearInterval(id);
  }, [reducedMotion, words.length]);

  useLayoutEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [shown, reducedMotion, text]);

  const visible = words.slice(0, reducedMotion ? words.length : shown);

  if (reducedMotion) {
    return (
      <div ref={viewportRef} className={cn("h-full overflow-hidden", className)}>
        <span className={TYPE.bodySm}>{text}</span>
      </div>
    );
  }

  return (
    <div
      ref={viewportRef}
      className={cn("h-full overflow-hidden [overflow-anchor:none]", className)}
    >
      <span className={TYPE.bodySm}>
        {visible.map((word, i) => (
          <motion.span
            key={`${i}-${word}`}
            initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{
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
                delay: 0.04,
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
    </div>
  );
}
