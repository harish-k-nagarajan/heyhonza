"use client";

import { useReducedMotion } from "motion/react";
import {
  createContext,
  useContext,
  useRef,
  type ReactNode,
  type RefObject,
} from "react";

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
  const sceneEnabled = !reducedMotion;

  useLandingChatScrollScene(bridgeRef, sceneEnabled);

  const contextValue: MorphContextValue = {
    bridgeRef,
    orbitRef,
  };

  return (
    <LandingBubbleMorphContext.Provider value={contextValue}>
      <div
        ref={bridgeRef}
        className={cn(
          "landing-bubble-bridge relative",
          sceneEnabled && "md:min-h-[275vh]",
        )}
      >
        <div data-landing-pin className="relative w-full">
          {children}
          {sceneEnabled ? (
            <div
              data-landing-morph-layer
              className="pointer-events-none absolute inset-0 z-[25] hidden overflow-visible md:block"
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
            </div>
          ) : null}
        </div>
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
  return <div className={cn("relative z-20", className)}>{children}</div>;
}
