import type { ReactNode } from "react";

import { cn } from "@/lib/cn";
import { TYPE } from "@/lib/design/typography";

export function LandingChatBubble({
  role,
  children,
  className,
}: {
  role: "honza" | "user";
  children: ReactNode;
  className?: string;
}) {
  const isUser = role === "user";

  return (
    <div
      className={cn(
        "max-w-[88%] rounded-[18px] px-4 py-2.5 text-left",
        TYPE.bodySm,
        "leading-snug",
        isUser
          ? "bg-gradient-to-r from-[#3a7bd5] to-[#5a94e8] text-white shadow-[0_2px_8px_rgba(58,123,213,0.18)]"
          : "border border-border bg-white/90 text-foreground",
        className,
      )}
    >
      {children}
    </div>
  );
}
