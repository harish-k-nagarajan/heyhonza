"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Mode = "signin" | "signup";
type Status = "idle" | "working" | "confirm-sent";

/** Supabase's minimum. Kept here so the hint and the check can't drift apart. */
const MIN_PASSWORD = 6;

function initialErrorCopy(code: string | undefined): string | null {
  switch (code) {
    case "link_invalid":
      return "That confirmation link expired or was already used. Sign in below, or create the account again to get a fresh one.";
    case "not_configured":
      return "Sign-in isn't configured yet on this deploy.";
    default:
      return null;
  }
}

/**
 * Turns Supabase's raw auth errors into something a learner can act on.
 * Matching on message text is unfortunate but Supabase doesn't give stable
 * codes for these; the fallback returns the original so nothing is swallowed.
 */
function friendlyError(raw: string): string {
  const m = raw.toLowerCase();
  if (m.includes("invalid login credentials")) {
    return "That email and password don't match. Try again, or create an account.";
  }
  if (m.includes("email not confirmed")) {
    return "Confirm your email first — check your inbox for the link.";
  }
  if (m.includes("already registered") || m.includes("already been registered")) {
    return "That email already has an account. Sign in instead.";
  }
  if (m.includes("password should be")) {
    return `Password needs at least ${MIN_PASSWORD} characters.`;
  }
  if (m.includes("rate limit") || m.includes("too many")) {
    return "Too many attempts for now. Wait a minute and try again.";
  }
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
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(
    initialErrorCopy(initialError),
  );

  if (!configured) {
    return (
      <div className="w-full max-w-[min(320px,100%)] rounded-card border border-border bg-card p-4 text-left">
        <p className="font-sans text-[10px] uppercase tracking-[0.25em] text-accent">
          {"// NOT CONFIGURED"}
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
      setMessage("Enter a valid email address.");
      return;
    }
    if (password.length < MIN_PASSWORD) {
      setMessage(`Password needs at least ${MIN_PASSWORD} characters.`);
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
        setMessage(friendlyError(error.message));
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
      setMessage(friendlyError(error.message));
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
          {"// CONFIRM YOUR EMAIL"}
        </p>
        <p className="mt-3 font-sans text-xs leading-relaxed tracking-[0.08em] text-foreground">
          Click the link I sent to
          <br />
          <span className="text-accent">{email.trim().toLowerCase()}</span>
          <br />
          <span className="text-muted-foreground">then come back and sign in.</span>
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
          Back to sign in
        </button>
      </div>
    );
  }

  const working = status === "working";

  return (
    <form onSubmit={onSubmit} className="w-full max-w-[min(320px,100%)] space-y-3">
      <div className="rounded-full border-2 border-accent bg-card px-4 py-2">
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          aria-label="Email"
          disabled={working}
          className="w-full bg-transparent font-sans text-sm tracking-[0.06em] text-foreground outline-none placeholder:text-muted-foreground disabled:opacity-60"
        />
      </div>

      <div className="rounded-full border-2 border-accent bg-card px-4 py-2">
        <input
          type="password"
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="password"
          aria-label="Password"
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

      <button
        type="submit"
        disabled={working}
        className="w-full rounded-full bg-accent py-3 font-sans text-xs uppercase tracking-[0.2em] text-accent-foreground transition hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
      >
        {working
          ? mode === "signup"
            ? "Creating…"
            : "Signing in…"
          : mode === "signup"
            ? "Create account"
            : "Sign in"}
      </button>

      <button
        type="button"
        onClick={() => {
          setMode(mode === "signin" ? "signup" : "signin");
          setMessage(null);
        }}
        className="w-full font-sans text-[11px] uppercase tracking-[0.2em] text-muted-foreground underline transition hover:text-foreground"
      >
        {mode === "signin" ? "New here? Create an account" : "Already have an account? Sign in"}
      </button>
    </form>
  );
}
