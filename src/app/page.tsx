"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { HonzaOrb } from "@/components/honza/HonzaOrb";
import { ROUTES } from "@/lib/constants";
import { useSettingsHydrated } from "@/hooks/useSettingsHydrated";
import { useSettingsStore } from "@/stores/useSettingsStore";

export default function HomePage() {
  const router = useRouter();
  const hydrated = useSettingsHydrated();
  const onboardingComplete = useSettingsStore((s) => s.onboardingComplete);

  useEffect(() => {
    if (hydrated && !onboardingComplete) {
      router.replace(ROUTES.onboarding);
    }
  }, [hydrated, onboardingComplete, router]);

  if (!hydrated || !onboardingComplete) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-[#F5F2EE] font-sans text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100dvh-7rem)] flex-col items-center justify-center gap-10 bg-[#F5F2EE] px-6 text-center">
      <HonzaOrb state="idle" size="hero" className="shrink-0" />
      <p className="max-w-[min(320px,100%)] font-sans text-sm leading-relaxed tracking-[0.12em] text-foreground/85">
        Learn Czech through daily chat. Honza writes in Czech—you reply in Czech.
      </p>
      <button
        type="button"
        onClick={() => router.push(ROUTES.chat)}
        className="w-full max-w-[min(320px,100%)] rounded-full bg-[#E8432D] py-3.5 font-sans text-xs font-medium uppercase tracking-[0.2em] text-white shadow-sm shadow-black/10 transition hover:bg-[#d63a28] active:scale-[0.98]"
      >
        OPEN CHAT
      </button>

      <form action="/auth/signout" method="post">
        <button
          type="submit"
          className="font-sans text-[11px] uppercase tracking-[0.2em] text-muted-foreground underline transition hover:text-foreground"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
