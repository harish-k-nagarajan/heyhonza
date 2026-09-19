"use client";

import { useReducedMotion } from "motion/react";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";

import { LANDING_DEMO_CONVERSATION } from "@/components/screens/welcome/landing/landing-demo-conversation";
import { cn } from "@/lib/cn";

import { LandingChatBubble } from "./LandingChatBubble";
import { useLandingChatScrollScene } from "./useLandingChatScrollScene";

type MorphContextValue = {
  bridgeRef: RefObject<HTMLDivElement | null>;
  orbitRef: RefObject<HTMLDivElement | null>;
};

const LandingBubbleMorphContext = createContext<MorphContextValue | null>(null);

export function useLandingBubbleMorph() {
  return useContext(LandingBubbleMorphContext);
}

export function LandingBubbleMorphProvider({ children }: { children: ReactNode }) {
  const reducedMotion = useReducedMotion();
  const bridgeRef = useRef<HTMLDivElement | null>(null);
  const orbitRef = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const sceneEnabled = !reducedMotion;

  useEffect(() => {
    setMounted(true);
  }, []);

  useLandingChatScrollScene(bridgeRef, sceneEnabled && mounted);

  const contextValue: MorphContextValue = {
    bridgeRef,
    orbitRef,
  };

  const morphLayer =
    sceneEnabled && mounted
      ? createPortal(
          <div
            data-landing-morph-layer
            className="pointer-events-none fixed inset-0 z-[25] overflow-visible"
            aria-hidden
          >
            {LANDING_DEMO_CONVERSATION.map((message, index) => (
              <div
                key={`ghost-${message.text}`}
                className="landing-morph-ghost absolute left-0 top-0 opacity-0 will-change-transform"
              >
                <LandingChatBubble role={message.role} messageIndex={index}>
                  {message.text}
                </LandingChatBubble>
              </div>
            ))}
          </div>,
          document.body,
        )
      : null;

  return (
    <LandingBubbleMorphContext.Provider value={contextValue}>
      <div
        ref={bridgeRef}
        className={cn(
          "landing-bubble-bridge relative",
          sceneEnabled && "min-h-[190vh] md:min-h-[260vh]",
        )}
      >
        <div data-landing-pin className="relative w-full">
          {children}
        </div>
        {morphLayer}
      </div>
    </LandingBubbleMorphContext.Provider>
  );
}

export function LandingHeroHeadlineScanner({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={cn("relative z-[1]", className)}>{children}</div>;
}
