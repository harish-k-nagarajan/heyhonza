"use client";

import { useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Status = "idle" | "sending" | "sent" | "error";

function errorCopy(code: string | undefined): string | null {
  switch (code) {
    case "link_invalid":
      return "That link expired or was already used. Request a fresh one below.";
    case "not_configured":
      return "Sign-in isn't configured yet on this deploy.";
    default:
      return null;
  }
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
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(errorCopy(initialError));

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
          <code className="text-foreground">.env.example</code>) to enable magic-link
          sign-in.
        </p>
      </div>
    );
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = email.trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(clean)) {
      setStatus("error");
      setMessage("Enter a valid email address.");
      return;
    }
    setStatus("sending");
    setMessage(null);

    const supabase = createSupabaseBrowserClient();
    const emailRedirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

    const { error } = await supabase.auth.signInWithOtp({
      email: clean,
      options: { emailRedirectTo },
    });

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }
    setStatus("sent");
  };

  if (status === "sent") {
    return (
      <div className="w-full max-w-[min(320px,100%)] rounded-card border border-border bg-card p-5 text-center">
        <p className="font-sans text-[10px] uppercase tracking-[0.25em] text-accent">
          {"// CHECK YOUR EMAIL"}
        </p>
        <p className="mt-3 font-sans text-xs leading-relaxed tracking-[0.08em] text-foreground">
          A magic link is on its way to
          <br />
          <span className="text-accent">{email.trim().toLowerCase()}</span>
        </p>
        <button
          type="button"
          onClick={() => {
            setStatus("idle");
            setMessage(null);
          }}
          className="mt-4 font-sans text-[11px] uppercase tracking-[0.2em] text-muted-foreground underline"
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-[min(320px,100%)] space-y-3">
      <div className="flex items-center gap-2 rounded-full border-2 border-accent bg-card px-4 py-2">
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          className="w-full bg-transparent font-sans text-sm tracking-[0.06em] text-foreground outline-none placeholder:text-muted-foreground"
          disabled={status === "sending"}
        />
      </div>

      {message ? (
        <p className="font-sans text-[11px] leading-relaxed tracking-[0.06em] text-accent">
          {message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full rounded-full bg-accent py-3 font-sans text-xs uppercase tracking-[0.2em] text-accent-foreground transition hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
      >
        {status === "sending" ? "Sending…" : "Send magic link"}
      </button>
    </form>
  );
}
