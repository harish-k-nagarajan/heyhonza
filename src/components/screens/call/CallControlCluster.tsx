"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { HardwareIcon } from "@/components/icons/HardwareIcons";
import { cn } from "@/lib/cn";
import { tapLight } from "@/lib/interaction/haptic";

function VolumeIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path
        d="M11 5 6 9H3v6h3l5 4V5zm4.5 2.5a7 7 0 0 1 0 11 1.5 1.5 0 0 0 2.1 2.1 10 10 0 0 0 0-15.2 1.5 1.5 0 0 0-2.1 2.1zM16 9.5a3.5 3.5 0 0 1 0 5 1.5 1.5 0 0 0 2.1 2.1 6.5 6.5 0 0 0 0-9.2 1.5 1.5 0 0 0-2.1 2.1z"
        opacity={active ? 1 : 0.85}
      />
    </svg>
  );
}

function HangIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 3a9 9 0 0 0-9 9v3l2-2v-1a7 7 0 0 1 14 0v1l2 2v-3a9 9 0 0 0-9-9zm-5 11 2.3 2.3a3 3 0 0 0 4.2 0L16 14l-1.4-1.4-2.3 2.3a1 1 0 0 1-1.4 0L8.6 12.6 7.2 14z" />
    </svg>
  );
}

const SPLIT_SPRING = { type: "spring" as const, stiffness: 420, damping: 26 };

export function CallControlCluster({
  inCall,
  disabled,
  speakerOn,
  callLabel,
  endLabel,
  speakerOnAria,
  speakerOffAria,
  onStartCall,
  onToggleSpeaker,
  onEndCall,
}: {
  inCall: boolean;
  disabled?: boolean;
  speakerOn: boolean;
  callLabel: string;
  endLabel: string;
  speakerOnAria: string;
  speakerOffAria: string;
  onStartCall: () => void;
  onToggleSpeaker: () => void;
  onEndCall: () => void;
}) {
  const reducedMotion = useReducedMotion();

  return (
    <div className="call-control-stage relative flex min-h-[76px] min-w-[220px] items-center justify-center">
      <AnimatePresence mode="wait" initial={false}>
        {!inCall ? (
          <motion.div
            key="call-cta"
            initial={reducedMotion ? false : { opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={
              reducedMotion
                ? { opacity: 0 }
                : {
                    opacity: 0,
                    scaleX: 1.65,
                    scaleY: 0.72,
                    borderRadius: "38%",
                    transition: { duration: 0.22, ease: [0.4, 0, 0.2, 1] },
                  }
            }
          >
            <button
              type="button"
              onClick={onStartCall}
              disabled={disabled}
              aria-label={callLabel}
              className="hmat-call-start flex h-[76px] w-[76px] items-center justify-center rounded-full text-white disabled:opacity-40"
            >
              <HardwareIcon name="call" size={30} emboss={false} />
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="in-call"
            className="grid grid-cols-2 gap-x-7 items-center"
            initial={reducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, transition: { duration: 0.15 } }}
          >
            <motion.div
              className="flex h-[76px] items-center justify-center"
              initial={
                reducedMotion ? false : { x: 34, scale: 0.45, opacity: 0 }
              }
              animate={{ x: 0, scale: 1, opacity: 1 }}
              transition={{ ...SPLIT_SPRING, delay: reducedMotion ? 0 : 0.06 }}
            >
              <button
                type="button"
                onClick={() => {
                  tapLight();
                  onToggleSpeaker();
                }}
                aria-pressed={speakerOn}
                aria-label={speakerOn ? speakerOnAria : speakerOffAria}
                className={cn(
                  "flex h-[76px] w-[76px] items-center justify-center rounded-full border transition",
                  speakerOn
                    ? "hmat-call-start border-white/25 text-white"
                    : "hmat-frost-action border-black/10 text-[#6E8A74]",
                )}
              >
                <VolumeIcon active={speakerOn} />
              </button>
            </motion.div>

            <motion.div
              className="flex h-[76px] items-center justify-center"
              initial={
                reducedMotion ? false : { x: -34, scale: 0.45, opacity: 0 }
              }
              animate={{ x: 0, scale: 1, opacity: 1 }}
              transition={{ ...SPLIT_SPRING, delay: reducedMotion ? 0 : 0.12 }}
            >
              <button
                type="button"
                onClick={() => {
                  tapLight();
                  onEndCall();
                }}
                aria-label={endLabel}
                className="hmat-call-end flex h-[76px] w-[76px] items-center justify-center rounded-full text-white"
              >
                <HangIcon />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
