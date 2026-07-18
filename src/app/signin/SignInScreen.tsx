"use client";

import { HmatOrb } from "@/components/honza/HmatOrb";
import { HonzaOrb } from "@/components/honza/HonzaOrb";
import { DESIGNS } from "@/lib/design/registry";
import { useDesignStore } from "@/stores/useDesignStore";

import { SignInForm } from "./SignInForm";

/**
 * Sign-in chrome, design-aware. The form itself (`SignInForm`) is token-based
 * and adapts to either design; this swaps the character + heading so the whole
 * screen reads as Hmat when Hmat is the active design. Auth state is resolved on
 * the server; these props are passed straight through.
 */
export function SignInScreen({
  configured,
  next,
  initialError,
}: {
  configured: boolean;
  next: string;
  initialError?: string;
}) {
  const design = useDesignStore((s) => s.design);
  const isHmat = DESIGNS[design].family === "hmat";

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] flex-col items-center justify-center gap-8 text-center">
      {isHmat ? (
        <div className="mat-recess flex w-full flex-col items-center px-4 py-6">
          <HmatOrb state="idle" size={128} />
        </div>
      ) : (
        <HonzaOrb state="idle" size="hero" className="shrink-0" />
      )}

      <div className="space-y-2">
        <p
          className={
            isHmat
              ? "font-display text-[10px] uppercase tracking-[0.2em] text-accent"
              : "font-sans text-[10px] uppercase tracking-[0.25em] text-muted-foreground"
          }
        >
          {isHmat ? "Přihlášení" : "// SIGN IN"}
        </p>
        <h1
          className={
            isHmat
              ? "font-display text-lg tracking-[0.1em] text-foreground"
              : "font-sans text-lg tracking-[0.12em] text-foreground"
          }
        >
          {isHmat ? "Ahoj! Já jsem Honza." : "Ahoj! I'm Honza."}
        </h1>
        <p className="mx-auto max-w-[min(300px,100%)] font-sans text-xs leading-relaxed tracking-[0.08em] text-muted-foreground">
          {isHmat
            ? "Přihlas se a navážeme s češtinou tam, kde jsi skončil."
            : "Sign in and we'll pick up your Czech where you left off."}
        </p>
      </div>

      <SignInForm
        configured={configured}
        next={next}
        initialError={initialError}
        isHmat={isHmat}
      />
    </div>
  );
}
