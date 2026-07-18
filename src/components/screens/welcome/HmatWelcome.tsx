"use client";

import Link from "next/link";

import { HmatOrb } from "@/components/honza/HmatOrb";
import { LEVEL_OPTIONS, ROUTES, TOPIC_OPTIONS } from "@/lib/constants";

import { WELCOME_STEPS_CS } from "./welcome-content";

/** Hmat Welcome — the front door in tactile material. */
export function HmatWelcome() {
  return (
    <div className="flex flex-col items-center gap-7 pb-4 text-center">
      <div className="mat-recess mt-2 flex w-full flex-col items-center px-4 py-7">
        <HmatOrb state="idle" size={132} />
        <div className="mat-channel mt-5" style={{ width: "50%" }} aria-hidden />
      </div>

      <div className="space-y-3">
        <p className="font-display text-[10px] uppercase tracking-[0.2em] text-accent">
          Ahoj, jsem Honza
        </p>
        <h1 className="font-display text-[26px] leading-tight tracking-[0.04em] text-foreground">
          Nauč se česky
          <br />
          jako s kamarádem
        </h1>
        <p className="mx-auto max-w-[300px] font-sans text-[13px] leading-relaxed text-muted-foreground">
          Žádné série, žádný žebříček. Jen Honza, který ti každý den píše česky —
          a čeká, až mu odepíšeš.
        </p>
      </div>

      <Link
        href={ROUTES.signin}
        className="mat-key press flex w-full max-w-[320px] items-center justify-center rounded-full py-3.5 font-display text-xs uppercase tracking-[0.2em] text-accent"
      >
        Začít se učit česky
      </Link>
      <p className="-mt-4 font-display text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        Zdarma · zabere minutu
      </p>

      <section className="mat w-full space-y-4 px-4 py-4 text-left">
        <p className="font-display text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          Jak to funguje
        </p>
        <ol className="space-y-4">
          {WELCOME_STEPS_CS.map((s) => (
            <li key={s.n} className="flex gap-3">
              <span className="shrink-0 font-display text-[11px] tracking-[0.14em] text-accent" aria-hidden>
                {s.n}
              </span>
              <div className="space-y-1">
                <p className="font-sans text-[13px] text-foreground">{s.title}</p>
                <p className="font-sans text-xs leading-relaxed text-muted-foreground">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="mat w-full space-y-3 px-4 py-4 text-left">
        <p className="font-display text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          O čem si budeš povídat
        </p>
        <div className="flex flex-wrap gap-2">
          {TOPIC_OPTIONS.map((t) => (
            <span
              key={t.id}
              className="rounded-full border border-border bg-card px-3 py-1.5 font-sans text-xs text-muted-foreground"
            >
              {t.label}
            </span>
          ))}
        </div>
      </section>

      <section className="mat w-full space-y-3 px-4 py-4 text-left">
        <p className="font-display text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          Potká tě na tvé úrovni
        </p>
        <div className="flex flex-wrap gap-2">
          {LEVEL_OPTIONS.map((l) => (
            <span
              key={l.id}
              className="rounded-full border border-border bg-card px-3 py-1.5 font-sans text-xs text-muted-foreground"
            >
              {l.label}
            </span>
          ))}
        </div>
      </section>

      <Link
        href={ROUTES.signin}
        className="font-display text-xs uppercase tracking-[0.2em] text-accent underline underline-offset-4"
      >
        Pojďme na to
      </Link>
    </div>
  );
}
