"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { cn } from "@/lib/cn";
import { TYPE } from "@/lib/design/typography";
import { useLocale } from "@/lib/i18n/useLocale";
import type { SignInCopy } from "@/lib/i18n/locales";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { DESIGNS } from "@/lib/design/registry";
import { useDesignStore } from "@/stores/useDesignStore";

type Mode = "signin" | "signup";
type Status = "idle" | "working" | "confirm-sent";

const MIN_PASSWORD = 6;

function initialErrorCopy(code: string | undefined, c: SignInCopy): string | null {
  switch (code) {
    case "link_invalid":
      return c.linkInvalid;
    case "not_configured":
      return c.notConfigured;
    default:
      return null;
  }
}

function friendlyError(raw: string, c: SignInCopy): string {
  const m = raw.toLowerCase();
  if (m.includes("invalid login credentials")) return c.badCredentials;
  if (m.includes("email not confirmed")) return c.emailNotConfirmed;
  if (m.includes("already registered") || m.includes("already been registered")) {
    return c.alreadyRegistered;
  }
  if (m.includes("password should be")) return c.passwordTooShort;
  if (m.includes("rate limit") || m.includes("too many")) return c.rateLimited;
  return raw;
}

export function SignInForm({
  configured,
  next,
  initialError,
}: {
  configured: boolean;
  next: string;
  initialError?: string;
}) {
  const router = useRouter();
  const { t } = useLocale();
  const c = t.signin;
  const isHmat = DESIGNS[useDesignStore((s) => s.design)].family === "hmat";
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(initialErrorCopy(initialError, c));

  if (!configured) {
    return (
      <div className="w-full max-w-[min(320px,100%)] rounded-card border border-border bg-card p-4 text-left">
        <p className={cn(TYPE.label, "text-accent")}>{c.notConfiguredLabel}</p>
        <p className={cn("mt-2", TYPE.helper)}>
          Add <code className="text-foreground">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code className="text-foreground">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to
          <code className="text-foreground"> .env.local</code> (see{" "}
          <code className="text-foreground">.env.example</code>) to enable sign-in.
        </p>
      </div>
    );
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(cleanEmail)) {
      setMessage(c.invalidEmail);
      return;
    }
    if (password.length < MIN_PASSWORD) {
      setMessage(c.passwordTooShort);
      return;
    }

    setStatus("working");
    setMessage(null);
    const supabase = createSupabaseBrowserClient();

    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });

      if (error) {
        setStatus("idle");
        setMessage(friendlyError(error.message, c));
        return;
      }

      if (data.session) {
        router.replace(next);
        router.refresh();
        return;
      }
      setStatus("confirm-sent");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error) {
      setStatus("idle");
      setMessage(friendlyError(error.message, c));
      return;
    }

    router.replace(next);
    router.refresh();
  };

  if (status === "confirm-sent") {
    return (
      <div className="w-full max-w-[min(320px,100%)] rounded-card border border-border bg-card p-5 text-center">
        <p className={cn(TYPE.label, "text-accent")}>{c.confirmLabel}</p>
        <p className={cn("mt-3", TYPE.helper, "text-foreground")}>
          {c.confirmLead}
          <br />
          <span className="text-accent">{email.trim().toLowerCase()}</span>
          <br />
          <span className="text-muted-foreground">{c.confirmTail}</span>
        </p>
        <button
          type="button"
          onClick={() => {
            setStatus("idle");
            setMode("signin");
            setMessage(null);
          }}
          className={cn(
            "mt-4 underline text-muted-foreground transition hover:text-foreground",
            TYPE.meta,
            "uppercase",
          )}
        >
          {c.backToSignin}
        </button>
      </div>
    );
  }

  const working = status === "working";
  const fieldWrap = isHmat
    ? "mat-field px-4 py-2.5"
    : "rounded-full border-2 border-accent bg-card px-4 py-2";

  return (
    <form onSubmit={onSubmit} className="w-full max-w-[min(320px,100%)] space-y-3">
      <div className="flex justify-center pb-1">
        <LanguageSwitcher />
      </div>

      <div className={fieldWrap}>
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={c.emailPlaceholder}
          aria-label={c.emailAria}
          disabled={working}
          className={cn(
            "w-full bg-transparent text-foreground outline-none placeholder:text-muted-foreground disabled:opacity-60",
            TYPE.bodySm,
          )}
        />
      </div>

      <div className={fieldWrap}>
        <input
          type="password"
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={c.passwordPlaceholder}
          aria-label={c.passwordAria}
          disabled={working}
          className={cn(
            "w-full bg-transparent text-foreground outline-none placeholder:text-muted-foreground disabled:opacity-60",
            TYPE.bodySm,
          )}
        />
      </div>

      {message ? (
        <p role="alert" className={cn(TYPE.helper, "text-accent")}>
          {message}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={working}
        surface={isHmat ? "mat-key" : "flat"}
        shape={isHmat ? "pill" : undefined}
        size={isHmat ? "md" : undefined}
        className={
          isHmat
            ? "disabled:opacity-60"
            : "w-full rounded-full py-3 hover:opacity-90 disabled:opacity-60"
        }
      >
        {working
          ? mode === "signup"
            ? c.creating
            : c.signingIn
          : mode === "signup"
            ? c.createAccount
            : c.signIn}
      </Button>

      <button
        type="button"
        onClick={() => {
          setMode(mode === "signin" ? "signup" : "signin");
          setMessage(null);
        }}
        className={cn(
          "w-full underline text-muted-foreground transition hover:text-foreground",
          TYPE.meta,
          "uppercase",
        )}
      >
        {mode === "signin" ? c.toggleToSignup : c.toggleToSignin}
      </button>
    </form>
  );
}
