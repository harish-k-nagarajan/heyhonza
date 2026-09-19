"use client";

import Image from "next/image";
import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/cn";

export function LandingIphoneNotificationPreview({
  appName,
  message,
  timeLabel,
  className,
  notifyOpen = false,
  ...rest
}: {
  appName: string;
  message: string;
  timeLabel: string;
  className?: string;
  notifyOpen?: boolean;
} & ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn("relative shrink-0 select-none", className)}
      aria-hidden
      {...rest}
    >
      <div className="relative">
        <span className="absolute -left-[3px] top-[78px] z-10 h-[14px] w-[3px] rounded-l-[1.5px] bg-[#3d3d40]" />
        <span className="absolute -left-[3px] top-[102px] z-10 h-[28px] w-[3px] rounded-l-[1.5px] bg-[#3d3d40]" />
        <span className="absolute -left-[3px] top-[134px] z-10 h-[28px] w-[3px] rounded-l-[1.5px] bg-[#3d3d40]" />
        <span className="absolute -right-[3px] top-[118px] z-10 h-[44px] w-[3px] rounded-r-[1.5px] bg-[#3d3d40]" />

        <div
          className={cn(
            "relative rounded-[42px] bg-[#1c1c1e] p-[3px]",
            "shadow-[inset_0_0_0_1px_#4a4a4c,inset_0_1px_0_rgba(255,255,255,0.22),0_24px_48px_rgba(28,24,20,0.22),0_8px_16px_rgba(28,24,20,0.12)]",
          )}
        >
          <div className="relative aspect-[473/1024] w-[190px] overflow-hidden rounded-[39px] bg-black md:w-[224px]">
            <Image
              src="/images/iphone-lockscreen.jpg"
              alt=""
              fill
              sizes="224px"
              quality={90}
              className="pointer-events-none object-cover object-center"
              draggable={false}
            />

            <div
              className="absolute left-1/2 top-[9px] z-30 flex h-[20px] w-[68px] -translate-x-1/2 items-center justify-end rounded-full bg-black pr-[7px] sm:h-[21px] sm:w-[72px]"
            >
              <span className="block h-[6px] w-[6px] rounded-full bg-[#0d1a2e] shadow-[inset_0_0_0_1px_rgba(80,100,160,0.35)]" />
            </div>

            <div className="absolute inset-x-[9px] bottom-[13.6%] z-20 sm:inset-x-[10px]">
              <div
                className={cn(
                  "t-toast landing-ios-ui rounded-[18px] px-[9px] py-[8px]",
                  notifyOpen && "is-open",
                  "bg-[rgba(72,72,74,0.78)] backdrop-blur-[28px] backdrop-saturate-[190%] backdrop-brightness-110",
                  "shadow-[0_8px_24px_rgba(0,0,0,0.42),inset_0_0.5px_0_rgba(255,255,255,0.34)]",
                  "ring-1 ring-inset ring-white/25",
                )}
              >
                <div className="flex items-start gap-[8px]">
                  <div className="relative h-[28px] w-[28px] shrink-0 overflow-hidden rounded-[7px] shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
                    <Image
                      src="/apple-touch-icon.png"
                      alt=""
                      width={28}
                      height={28}
                      className="h-full w-full object-cover"
                      draggable={false}
                    />
                  </div>
                  <div className="min-w-0 flex-1 pt-[1px]">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="truncate text-[11px] font-semibold leading-none tracking-[0.01em] text-white">
                        {appName}
                      </p>
                      <span className="shrink-0 text-[11px] font-normal leading-none text-white/70">
                        {timeLabel}
                      </span>
                    </div>
                    <p className="mt-[3px] line-clamp-3 text-[12px] font-normal leading-[1.28] tracking-[-0.01em] text-white">
                      {message}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
