"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { HmatOrb } from "@/components/honza/HmatOrb";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { cn } from "@/lib/cn";
import { ROUTES } from "@/lib/constants";
import { TYPE } from "@/lib/design/typography";
import { useLocale } from "@/lib/i18n/useLocale";
import type { SignInCopy } from "@/lib/i18n/locales";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type AuthMode = "signup" | "login";
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

function AuthField({
  type,
  value,
  onChange,
  placeholder,
  ariaLabel,
  autoComplete,
  disabled,
}: {
  type: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  ariaLabel: string;
  autoComplete?: string;
  disabled?: boolean;
}) {
  return (
    <div className="auth-field flex h-12 w-full items-center px-4">
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        autoComplete={autoComplete}
        disabled={disabled}
        className={cn(
          "w-full bg-transparent text-foreground outline-none placeholder:text-muted-foreground disabled:opacity-60",
          TYPE.bodySm,
        )}
      />
    </div>
  );
}

export function AuthScreen({
  mode,
  configured,
  next,
  initialError,
}: {
  mode: AuthMode;
  configured: boolean;
  next: string;
  initialError?: string;
}) {
  const router = useRouter();
  const { t } = useLocale();
  const c = t.signin;
  const copy = mode === "signup" ? c.signup : c.login;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(initialErrorCopy(initialError, c));

  if (!configured) {
    return (
      <div className="flex min-h-[calc(100dvh-4rem)] items-center justify-center px-4 py-10">
        <div className="auth-card w-full max-w-[390px] rounded-[28px] border border-border bg-background p-6 text-left">
          <p className={cn(TYPE.label, "text-accent")}>{c.notConfiguredLabel}</p>
          <p className={cn("mt-2", TYPE.helper)}>
            Add <code className="text-foreground">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
            <code className="text-foreground">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to
            <code className="text-foreground"> .env.local</code> (see{" "}
            <code className="text-foreground">.env.example</code>) to enable sign-in.
          </p>
        </div>
      </div>
    );
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    if (mode === "signup" && !cleanName) {
      setMessage(c.enterName);
      return;
    }
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
          data: { full_name: cleanName, display_name: cleanName },
        },
      });

      if (error) {
        setStatus("idle");
        setMessage(friendlyError(error.message, c));
        return;
      }

      if (data.session) {
        router.replace(next);
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
  };

  if (status === "confirm-sent") {
    return (
      <div className="flex min-h-[calc(100dvh-4rem)] items-center justify-center px-4 py-10">
        <div className="auth-card w-full max-w-[390px] rounded-[28px] border border-border bg-background p-6 text-center">
          <p className={cn(TYPE.label, "text-accent")}>{c.confirmLabel}</p>
          <p className={cn("mt-3", TYPE.helper, "text-foreground")}>
            {c.confirmLead}
            <br />
            <span className="text-accent">{email.trim().toLowerCase()}</span>
            <br />
            <span className="text-muted-foreground">{c.confirmTail}</span>
          </p>
          <Link
            href={ROUTES.login}
            className={cn(
              "mt-4 inline-block underline text-muted-foreground transition hover:text-foreground",
              TYPE.meta,
              "uppercase",
            )}
          >
            {c.backToSignin}
          </Link>
        </div>
      </div>
    );
  }

  const working = status === "working";

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] w-full items-center justify-center px-4 py-10">
      <form
        onSubmit={onSubmit}
        className="auth-card flex w-full max-w-[390px] flex-col items-center gap-3.5 rounded-[28px] border border-border bg-background px-5 pb-7 pt-6"
      >
        <div className="flex w-full justify-end">
          <LanguageSwitcher />
        </div>

        <div className="mat-recess flex w-full flex-col items-center rounded-[20px] px-4 py-4">
          <HmatOrb state="idle" size={120} floorLight={false} />
        </div>

        <p className={cn(TYPE.label, "text-accent")}>{copy.kicker}</p>

        <h1 className={cn(TYPE.display, "text-center text-2xl text-foreground")}>
          {copy.heading}
        </h1>

        <p
          className={cn(
            "max-w-[320px] text-center",
            TYPE.subtitle,
            "text-[14px] leading-[1.45]",
          )}
        >
          {copy.subtitle}
        </p>

        <div className="flex w-full flex-col gap-2.5">
          {mode === "signup" ? (
            <AuthField
              type="text"
              value={name}
              onChange={setName}
              placeholder={c.signup.namePlaceholder}
              ariaLabel={c.signup.namePlaceholder}
              autoComplete="name"
              disabled={working}
            />
          ) : null}

          <AuthField
            type="email"
            value={email}
            onChange={setEmail}
            placeholder={copy.emailPlaceholder}
            ariaLabel={c.emailAria}
            autoComplete="email"
            disabled={working}
          />

          <AuthField
            type="password"
            value={password}
            onChange={setPassword}
            placeholder={copy.passwordPlaceholder}
            ariaLabel={c.passwordAria}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            disabled={working}
          />
        </div>

        {message ? (
          <p role="alert" className={cn(TYPE.helper, "w-full text-accent")}>
            {message}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={working}
          className={cn(
            "w-full rounded-full py-3.5 font-sans text-[15px] font-semibold normal-case tracking-normal disabled:opacity-60",
            mode === "signup" ? "auth-cta-primary" : "auth-cta-secondary",
          )}
        >
          {working
            ? mode === "signup"
              ? c.creating
              : c.signingIn
            : copy.cta}
        </button>

        {mode === "login" ? (
          <Link
            href={ROUTES.signup}
            className="auth-cta-outline flex w-full items-center justify-center rounded-full py-3.5 font-sans text-[15px] font-semibold"
          >
            {c.login.secondaryCta}
          </Link>
        ) : (
          <Link
            href={ROUTES.login}
            className="auth-cta-secondary flex w-full items-center justify-center rounded-full py-3.5 font-sans text-[15px] font-semibold"
          >
            {c.signup.switchPrompt} {c.signup.switchLink}
          </Link>
        )}
      </form>
    </div>
  );
}
