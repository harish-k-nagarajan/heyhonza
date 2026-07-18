"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/cn";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Mode = "signin" | "signup";
type Status = "idle" | "working" | "confirm-sent";

/** Supabase's minimum. Kept here so the hint and the check can't drift apart. */
const MIN_PASSWORD = 6;

/**
 * All learner-facing sign-in copy, keyed by design language. Classic keeps its
 * shipped English byte-for-byte; Hmat leads in full Czech (with diacritics) so
 * the whole screen reads as one language. `en` is the fallback everywhere.
 */
function strings(isHmat: boolean) {
  return isHmat
    ? {
        notConfiguredLabel: "// NENÍ NASTAVENO",
        confirmLabel: "// POTVRĎ SVŮJ E-MAIL",
        confirmLead: "Klikni na odkaz, který jsem poslal na",
        confirmTail: "pak se vrať a přihlas se.",
        backToSignin: "Zpět na přihlášení",
        emailPlaceholder: "ty@email.cz",
        passwordPlaceholder: "heslo",
        emailAria: "E-mail",
        passwordAria: "Heslo",
        creating: "Vytvářím…",
        signingIn: "Přihlašuji…",
        createAccount: "Vytvořit účet",
        signIn: "Přihlásit se",
        toggleToSignup: "Nemáš účet? Vytvoř si ho",
        toggleToSignin: "Už účet máš? Přihlas se",
        invalidEmail: "Zadej platnou e-mailovou adresu.",
        passwordTooShort: `Heslo musí mít aspoň ${MIN_PASSWORD} znaků.`,
        linkInvalid:
          "Ten potvrzovací odkaz vypršel nebo už byl použitý. Přihlas se níže, nebo si účet vytvoř znovu a přijde nový.",
        notConfigured: "Přihlášení zatím na tomto nasazení není nastavené.",
        badCredentials: "E-mail a heslo nesedí. Zkus to znovu, nebo si vytvoř účet.",
        emailNotConfirmed:
          "Nejdřív potvrď svůj e-mail — zkontroluj schránku a klikni na odkaz.",
        alreadyRegistered: "Tenhle e-mail už účet má. Přihlas se.",
        rateLimited: "Zatím moc pokusů. Počkej chvíli a zkus to znovu.",
      }
    : {
        notConfiguredLabel: "// NOT CONFIGURED",
        confirmLabel: "// CONFIRM YOUR EMAIL",
        confirmLead: "Click the link I sent to",
        confirmTail: "then come back and sign in.",
        backToSignin: "Back to sign in",
        emailPlaceholder: "you@email.com",
        passwordPlaceholder: "password",
        emailAria: "Email",
        passwordAria: "Password",
        creating: "Creating…",
        signingIn: "Signing in…",
        createAccount: "Create account",
        signIn: "Sign in",
        toggleToSignup: "New here? Create an account",
        toggleToSignin: "Already have an account? Sign in",
        invalidEmail: "Enter a valid email address.",
        passwordTooShort: `Password needs at least ${MIN_PASSWORD} characters.`,
        linkInvalid:
          "That confirmation link expired or was already used. Sign in below, or create the account again to get a fresh one.",
        notConfigured: "Sign-in isn't configured yet on this deploy.",
        badCredentials: "That email and password don't match. Try again, or create an account.",
        emailNotConfirmed: "Confirm your email first — check your inbox for the link.",
        alreadyRegistered: "That email already has an account. Sign in instead.",
        rateLimited: "Too many attempts for now. Wait a minute and try again.",
      };
}

type Copy = ReturnType<typeof strings>;

function initialErrorCopy(code: string | undefined, c: Copy): string | null {
  switch (code) {
    case "link_invalid":
      return c.linkInvalid;
    case "not_configured":
      return c.notConfigured;
    default:
      return null;
  }
}

/**
 * Turns Supabase's raw auth errors into something a learner can act on.
 * Matching on message text is unfortunate but Supabase doesn't give stable
 * codes for these; the fallback returns the original so nothing is swallowed.
 */
function friendlyError(raw: string, c: Copy): string {
  const m = raw.toLowerCase();
  if (m.includes("invalid login credentials")) {
    return c.badCredentials;
  }
  if (m.includes("email not confirmed")) {
    return c.emailNotConfirmed;
  }
  if (m.includes("already registered") || m.includes("already been registered")) {
    return c.alreadyRegistered;
  }
  if (m.includes("password should be")) {
    return c.passwordTooShort;
  }
  if (m.includes("rate limit") || m.includes("too many")) {
    return c.rateLimited;
  }
  return raw;
}

export function SignInForm({
  configured,
  next,
  initialError,
  isHmat = false,
}: {
  configured: boolean;
  next: string;
  initialError?: string;
  /** Hmat gives the form tactile material controls + full-Czech copy. */
  isHmat?: boolean;
}) {
  const router = useRouter();
  const c = strings(isHmat);
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(
    initialErrorCopy(initialError, c),
  );

  if (!configured) {
    return (
      <div className="w-full max-w-[min(320px,100%)] rounded-card border border-border bg-card p-4 text-left">
        <p className="font-sans text-[10px] uppercase tracking-[0.25em] text-accent">
          {c.notConfiguredLabel}
        </p>
        <p className="mt-2 font-sans text-xs leading-relaxed tracking-[0.06em] text-muted-foreground">
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

      // With "Confirm email" on, Supabase returns a user but no session — the
      // account isn't usable until the emailed link is clicked. If confirmation
      // is ever turned off, a session comes back instead and we can go straight
      // in, so handle both rather than assuming the project's setting.
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

    // The session cookie is set by the browser client; refresh() re-runs the
    // server components (and middleware) so they see the new auth state.
    router.replace(next);
    router.refresh();
  };

  if (status === "confirm-sent") {
    return (
      <div className="w-full max-w-[min(320px,100%)] rounded-card border border-border bg-card p-5 text-center">
        <p className="font-sans text-[10px] uppercase tracking-[0.25em] text-accent">
          {c.confirmLabel}
        </p>
        <p className="mt-3 font-sans text-xs leading-relaxed tracking-[0.08em] text-foreground">
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
          className="mt-4 font-sans text-[11px] uppercase tracking-[0.2em] text-muted-foreground underline transition hover:text-foreground"
        >
          {c.backToSignin}
        </button>
      </div>
    );
  }

  const working = status === "working";

  // Field + submit chrome: Hmat uses tactile material (recessed `mat-field`
  // pills, a mechanical `mat-key` submit); Classic keeps its accent-outline
  // pills and solid accent button byte-for-byte.
  const fieldWrap = isHmat
    ? "mat-field px-4 py-2.5"
    : "rounded-full border-2 border-accent bg-card px-4 py-2";
  const submitBtn = isHmat
    ? "mat-key press w-full rounded-full py-3 font-display text-xs uppercase tracking-[0.2em] text-accent disabled:opacity-60"
    : "w-full rounded-full bg-accent py-3 font-sans text-xs uppercase tracking-[0.2em] text-accent-foreground transition hover:opacity-90 active:scale-[0.98] disabled:opacity-60";

  return (
    <form onSubmit={onSubmit} className="w-full max-w-[min(320px,100%)] space-y-3">
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
          className="w-full bg-transparent font-sans text-sm tracking-[0.06em] text-foreground outline-none placeholder:text-muted-foreground disabled:opacity-60"
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
          className="w-full bg-transparent font-sans text-sm tracking-[0.06em] text-foreground outline-none placeholder:text-muted-foreground disabled:opacity-60"
        />
      </div>

      {message ? (
        <p
          role="alert"
          className="font-sans text-[11px] leading-relaxed tracking-[0.06em] text-accent"
        >
          {message}
        </p>
      ) : null}

      <button type="submit" disabled={working} className={cn(submitBtn)}>
        {working
          ? mode === "signup"
            ? c.creating
            : c.signingIn
          : mode === "signup"
            ? c.createAccount
            : c.signIn}
      </button>

      <button
        type="button"
        onClick={() => {
          setMode(mode === "signin" ? "signup" : "signin");
          setMessage(null);
        }}
        className="w-full font-sans text-[11px] uppercase tracking-[0.2em] text-muted-foreground underline transition hover:text-foreground"
      >
        {mode === "signin" ? c.toggleToSignup : c.toggleToSignin}
      </button>
    </form>
  );
}
