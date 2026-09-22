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
        <span className="absolute -left-[2px] top-[16.5%] z-10 h-[3%] w-[3px] rounded-l-[1.5px] bg-[#3d3d40]" />
        <span className="absolute -left-[2px] top-[21.5%] z-10 h-[6%] w-[3px] rounded-l-[1.5px] bg-[#3d3d40]" />
        <span className="absolute -left-[2px] top-[28.5%] z-10 h-[6%] w-[3px] rounded-l-[1.5px] bg-[#3d3d40]" />
        <span className="absolute -right-[2px] top-[25%] z-10 h-[9.5%] w-[3px] rounded-r-[1.5px] bg-[#3d3d40]" />

        <div
          className={cn(
            "relative rounded-[clamp(26px,18%,42px)] bg-[#1c1c1e] p-[3px]",
            "shadow-[inset_0_0_0_1px_#4a4a4c,inset_0_1px_0_rgba(255,255,255,0.22),0_24px_48px_rgba(28,24,20,0.22),0_8px_16px_rgba(28,24,20,0.12)]",
          )}
        >
          <div className="relative aspect-[473/1024] w-full overflow-hidden rounded-[clamp(23px,16%,39px)] bg-black md:w-[224px]">
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
              className="absolute left-1/2 top-[2.2%] z-30 flex h-[5%] w-[36%] max-h-[22px] -translate-x-1/2 items-center justify-end rounded-full bg-black pr-[6%] min-h-[16px]"
            >
              <span className="block h-[6px] w-[6px] rounded-full bg-[#0d1a2e] shadow-[inset_0_0_0_1px_rgba(80,100,160,0.35)]" />
            </div>

            <div className="absolute inset-x-[9px] bottom-[13.6%] z-20 sm:inset-x-[10px]">
              <div
                className={cn(
                  "t-toast landing-ios-ui rounded-2xl px-2 py-1.5 md:rounded-[18px] md:px-[9px] md:py-[8px]",
                  notifyOpen && "is-open",
                  "bg-[rgba(72,72,74,0.78)] backdrop-blur-[28px] backdrop-saturate-[190%] backdrop-brightness-110",
                  "shadow-[0_8px_24px_rgba(0,0,0,0.42),inset_0_0.5px_0_rgba(255,255,255,0.34)]",
                  "ring-1 ring-inset ring-white/25",
                )}
              >
                <div className="flex items-start gap-1.5 md:gap-[8px]">
                  <div className="relative h-5 w-5 shrink-0 overflow-hidden rounded-[5px] shadow-[0_1px_2px_rgba(0,0,0,0.4)] md:h-7 md:w-7 md:rounded-[7px]">
                    <Image
                      src="/apple-touch-icon.png"
                      alt=""
                      width={24}
                      height={24}
                      className="h-full w-full object-cover"
                      draggable={false}
                    />
                  </div>
                  <div className="min-w-0 flex-1 pt-[1px]">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="truncate text-[10px] font-semibold leading-none tracking-[0.01em] text-white md:text-[11px]">
                        {appName}
                      </p>
                      <span className="shrink-0 text-[10px] font-normal leading-none text-white/70 md:text-[11px]">
                        {timeLabel}
                      </span>
                    </div>
                    <p className="mt-[2px] line-clamp-2 text-[10px] font-normal leading-[1.25] tracking-[-0.01em] text-white md:mt-[3px] md:text-[12px] md:leading-[1.28]">
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
