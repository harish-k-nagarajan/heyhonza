"use client";

import { DEMO_CHAT_BEATS } from "@/components/screens/welcome/welcome-content";

export function LandingDemoChat() {
  return (
    <div className="landing-panel landing-demo-frame mx-auto max-w-[380px] md:max-w-none">
      <div className="mb-3 flex items-center justify-between">
        <p className="font-display text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
          Conversation preview
        </p>
        <span className="mat inline-flex items-center gap-1.5 rounded-full px-2.5 py-1">
          <span
            className="h-[6px] w-[6px] rounded-full bg-accent"
            style={{ boxShadow: "0 0 6px var(--accent)" }}
            aria-hidden
          />
          <span className="font-display text-[8px] uppercase tracking-[0.12em] text-accent">
            Preview
          </span>
        </span>
      </div>

      <div className="relative min-h-[220px] space-y-3">
        {DEMO_CHAT_BEATS.map((beat, beatIndex) => (
          <div
            key={beatIndex}
            className="landing-demo-beat absolute inset-x-0 top-0 space-y-3"
            style={{ opacity: beatIndex === 0 ? 1 : 0 }}
          >
            <div className="flex justify-start">
              <div className="mat-metal max-w-[88%] rounded-[18px] px-4 py-3 text-left">
                <p className="mb-1 font-display text-[8px] uppercase tracking-[0.14em] text-muted-foreground">
                  Honza
                </p>
                <p className="font-sans text-[14px] leading-snug text-foreground">{beat.honza}</p>
              </div>
            </div>
            <div className="flex justify-end">
              <div
                className="max-w-[82%] rounded-[18px] px-4 py-3 text-left"
                style={{
                  background: "var(--accent)",
                  color: "var(--accent-foreground, #fff)",
                }}
              >
                <p className="mb-1 font-display text-[8px] uppercase tracking-[0.14em] opacity-80">
                  You
                </p>
                <p className="font-sans text-[14px] leading-snug">{beat.user}</p>
              </div>
            </div>
            <div className="flex justify-start">
              <div className="mat max-w-[88%] rounded-[18px] border border-accent/20 px-4 py-3 text-left">
                <p className="mb-1 font-display text-[8px] uppercase tracking-[0.14em] text-accent">
                  Correction
                </p>
                <p className="font-sans text-[13px] leading-snug text-foreground">{beat.honzaFix}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
