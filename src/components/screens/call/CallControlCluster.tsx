"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { HardwareIcon } from "@/components/icons/HardwareIcons";
import { tapLight } from "@/lib/interaction/haptic";

function HangIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 3a9 9 0 0 0-9 9v3l2-2v-1a7 7 0 0 1 14 0v1l2 2v-3a9 9 0 0 0-9-9zm-5 11 2.3 2.3a3 3 0 0 0 4.2 0L16 14l-1.4-1.4-2.3 2.3a1 1 0 0 1-1.4 0L8.6 12.6 7.2 14z" />
    </svg>
  );
}

export function CallControlCluster({
  inCall,
  disabled,
  callLabel,
  endLabel,
  onStartCall,
  onEndCall,
}: {
  inCall: boolean;
  disabled?: boolean;
  callLabel: string;
  endLabel: string;
  onStartCall: () => void;
  onEndCall: () => void;
}) {
  const reducedMotion = useReducedMotion();

  return (
    <div className="call-control-stage relative flex min-h-[60px] min-w-[200px] items-center justify-center">
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
              className="hmat-call-start hmat-call-btn flex items-center justify-center rounded-full text-white disabled:opacity-40"
            >
              <HardwareIcon name="call" size={24} emboss={false} />
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="in-call"
            className="flex items-center justify-center"
            initial={reducedMotion ? false : { opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, transition: { duration: 0.15 } }}
            transition={{ type: "spring", stiffness: 420, damping: 26 }}
          >
            <button
              type="button"
              onClick={() => {
                tapLight();
                onEndCall();
              }}
              aria-label={endLabel}
              className="hmat-call-end hmat-call-btn flex items-center justify-center rounded-full text-white"
            >
              <HangIcon />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
