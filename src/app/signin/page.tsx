import { redirect } from "next/navigation";

import { HonzaOrb } from "@/components/honza/HonzaOrb";
import { ROUTES } from "@/lib/constants";
import { getCurrentUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";

import { SignInForm } from "./SignInForm";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: { next?: string; error?: string };
}) {
  const configured = isSupabaseConfigured();

  if (configured) {
    const user = await getCurrentUser();
    if (user) redirect(ROUTES.home);
  }

  const next =
    typeof searchParams.next === "string" && searchParams.next.startsWith("/")
      ? searchParams.next
      : ROUTES.home;

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] flex-col items-center justify-center gap-8 px-2 text-center">
      <HonzaOrb state="idle" size="hero" className="shrink-0" />

      <div className="space-y-2">
        <p className="font-sans text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          {"// SIGN IN"}
        </p>
        <h1 className="font-sans text-lg tracking-[0.12em] text-foreground">
          Ahoj! I&apos;m Honza.
        </h1>
        <p className="mx-auto max-w-[min(300px,100%)] font-sans text-xs leading-relaxed tracking-[0.08em] text-muted-foreground">
          Enter your email and I&apos;ll send you a magic link — no password to
          remember.
        </p>
      </div>

      <SignInForm configured={configured} next={next} initialError={searchParams.error} />
    </div>
  );
}
