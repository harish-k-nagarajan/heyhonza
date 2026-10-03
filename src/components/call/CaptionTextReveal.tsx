"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

import { HONZA_STATE_COLORS } from "@/components/honza/theme";
import { cn } from "@/lib/cn";

const WORD_GAP_MS = 55;
const VISIBLE_LINES = 3;
const INK = "#243D2C";
/** Fern accent the orb uses while speaking. Live `--accent` is still thinking-blue for a frame, and turns blue again when the learner's turn starts. */
const RESOLVING = HONZA_STATE_COLORS.speaking.accent;
const EASE = [0.22, 1, 0.36, 1] as const;

/** Larger than chat `bodySm`. The learner reads this on speaker, often at arm's length. */
export const CAPTION_TYPE = "font-sans text-lg leading-relaxed tracking-normal";

/**
 * One Honza utterance, revealed word by word. About three lines stay in
 * view, all at full ink, so a wrapped sentence stays readable. Anything
 * older than that window drifts up out of view.
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
  const [settled, setSettled] = useState(false);
  const [metrics, setMetrics] = useState<{ lineHeight: number; lines: number[] }>({
    lineHeight: 0,
    lines: [],
  });
  const wordRefs = useRef<Array<HTMLSpanElement | null>>([]);

  useEffect(() => {
    if (reducedMotion || words.length <= 1) return;
    let n = 1;
    const id = window.setInterval(() => {
      n += 1;
      setShown(n);
      if (n >= words.length) window.clearInterval(id);
    }, WORD_GAP_MS);
    return () => window.clearInterval(id);
  }, [reducedMotion, words]);

  useEffect(() => {
    if (reducedMotion || shown < words.length) return;
    const id = window.setTimeout(() => setSettled(true), 420);
    return () => window.clearTimeout(id);
  }, [reducedMotion, shown, words.length]);

  const count = reducedMotion ? words.length : Math.min(shown, words.length);

  useLayoutEffect(() => {
    if (reducedMotion || count === 0) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      const tops: number[] = [];
      let wordHeight = 0;
      for (let i = 0; i < count; i++) {
        const el = wordRefs.current[i];
        if (!el) {
          tops.push(Number.NaN);
          continue;
        }
        tops.push(el.offsetTop);
        wordHeight = el.offsetHeight || wordHeight;
      }
      const lines = lineIndexes(tops);
      const uniqueTops = uniqueLineTops(tops);
      const lineHeight = Math.round(
        uniqueTops.length >= 2 ? uniqueTops[1]! - uniqueTops[0]! : wordHeight,
      );
      setMetrics((prev) => {
        if (prev.lineHeight === lineHeight && sameNumbers(prev.lines, lines)) return prev;
        return { lineHeight, lines };
      });
    });
    return () => {
      cancelled = true;
    };
  }, [count, reducedMotion, text]);

  if (reducedMotion) {
    return (
      <p className={cn(CAPTION_TYPE, "font-normal text-left text-[#243D2C]", className)}>{text}</p>
    );
  }

  const lastMeasured =
    metrics.lines.length > 0 ? metrics.lines[metrics.lines.length - 1]! : 0;
  const currentLine = metrics.lines[count - 1] ?? lastMeasured;
  const offsetLines = Math.max(0, currentLine - (VISIBLE_LINES - 1));
  const rows = Math.min(VISIBLE_LINES, Math.max(currentLine + 1, 1));
  const viewportHeight = metrics.lineHeight > 0 ? rows * metrics.lineHeight : undefined;
  const resolvingIndex = settled ? -1 : count - 1;

  return (
    <div className={cn("w-full", className)}>
      <span className="sr-only">{text}</span>
      <div
        className={cn(
          "hmat-caption-viewport max-h-full w-full overflow-hidden",
          offsetLines > 0 && "hmat-caption-viewport--fade",
        )}
        style={viewportHeight ? { height: viewportHeight } : undefined}
        aria-hidden
      >
        <div
          className={cn(
            "hmat-caption-track w-full break-words text-left",
            CAPTION_TYPE,
            "font-normal",
          )}
          style={{
            transform:
              metrics.lineHeight > 0
                ? `translate3d(0, ${-offsetLines * metrics.lineHeight}px, 0)`
                : undefined,
          }}
        >
          {words.slice(0, count).map((word, i) => {
            const line = metrics.lines[i] ?? currentLine;
            const dist = currentLine - line;
            const opacity = dist < VISIBLE_LINES ? 1 : 0;
            const resolving = i === resolvingIndex;
            return (
              <motion.span
                key={`${i}-${word}`}
                ref={(el) => {
                  wordRefs.current[i] = el;
                }}
                initial={{ opacity: 0, y: 8, filter: "blur(4px)", color: RESOLVING }}
                animate={{
                  opacity,
                  y: 0,
                  filter: "blur(0px)",
                  color: resolving ? RESOLVING : INK,
                }}
                transition={{
                  opacity: { duration: 0.4, ease: EASE },
                  y: { duration: 0.38, ease: EASE },
                  filter: { duration: 0.38, ease: EASE },
                  color: { duration: resolving ? 0.05 : 0.22, ease: EASE },
                }}
                className="mr-[0.28em] inline-block align-baseline font-normal not-italic last:mr-0"
              >
                {word}
              </motion.span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function lineIndexes(tops: number[]): number[] {
  const indexes: number[] = [];
  let line = 0;
  let lineTop = tops[0] ?? 0;
  for (let i = 0; i < tops.length; i++) {
    const top = tops[i] ?? lineTop;
    if (!Number.isFinite(top)) {
      indexes.push(line);
      continue;
    }
    if (i > 0 && top > lineTop + 2) {
      line += 1;
      lineTop = top;
    }
    indexes.push(line);
  }
  return indexes;
}

function uniqueLineTops(tops: number[]): number[] {
  const unique: number[] = [];
  for (const top of tops) {
    if (!Number.isFinite(top)) continue;
    if (unique.length === 0 || top > unique[unique.length - 1] + 2) unique.push(top);
  }
  return unique;
}

function sameNumbers(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}
