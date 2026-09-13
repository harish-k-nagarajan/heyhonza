"use client";

import Image from "next/image";

import { cn } from "@/lib/cn";
import { TYPE } from "@/lib/design/typography";

export function LandingIphoneNotificationPreview({
  appName,
  message,
  timeLabel,
  className,
}: {
  appName: string;
  message: string;
  timeLabel: string;
  className?: string;
}) {
  return (
    <div
      className={cn("relative shrink-0 select-none", className)}
      aria-hidden
    >
      <div
        className={cn(
          "rounded-[44px] bg-[#1C1C1E] p-[5px]",
          "shadow-[0_24px_48px_rgba(28,24,20,0.22),0_8px_16px_rgba(28,24,20,0.12)]",
        )}
      >
        <div className="relative h-[380px] w-[196px] overflow-hidden rounded-[39px] bg-[#0a0a0a] sm:h-[400px] sm:w-[204px]">
          <div
            className="absolute inset-0 bg-gradient-to-br from-[#5B8FBD] via-[#7BA4C9] to-[#E8C4A8]"
            aria-hidden
          />
          <div
            className="absolute inset-0 opacity-40 mix-blend-soft-light"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.45) 0%, transparent 45%), radial-gradient(circle at 80% 70%, rgba(255,200,180,0.35) 0%, transparent 50%)",
            }}
            aria-hidden
          />

          <div
            className="absolute left-1/2 top-2.5 z-20 h-[26px] w-[88px] -translate-x-1/2 rounded-full bg-black"
            aria-hidden
          />

          <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-6 pt-3.5">
            <span className="font-sans text-[11px] font-semibold text-white/95">9:41</span>
            <div className="flex items-center gap-1" aria-hidden>
              <span className="h-2 w-3 rounded-sm border border-white/80" />
              <span className="h-2.5 w-2.5 rounded-full border border-white/80" />
            </div>
          </div>

          <div className="absolute inset-x-0 top-[72px] z-10 px-2.5">
            <div
              className={cn(
                "rounded-[18px] border border-white/25 bg-white/72 p-3 backdrop-blur-xl",
                "shadow-[0_8px_24px_rgba(0,0,0,0.12)]",
              )}
            >
              <div className="flex items-start gap-2.5">
                <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-[10px] shadow-sm">
                  <Image
                    src="/apple-touch-icon.png"
                    alt=""
                    width={36}
                    height={36}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className={cn(TYPE.label, "text-[10px] text-[#3D3835]")}>{appName}</p>
                    <span className="shrink-0 font-sans text-[10px] text-[#6B625C]">{timeLabel}</span>
                  </div>
                  <p className={cn("mt-0.5 line-clamp-3", TYPE.bodySm, "text-[12px] leading-snug text-[#2A2420]")}>
                    {message}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-1.5 left-1/2 z-20 h-1 w-[100px] -translate-x-1/2 rounded-full bg-white/90" aria-hidden />
        </div>
      </div>
    </div>
  );
}
