"use client";

import Link from "next/link";

import { HmatOrb } from "@/components/honza/HmatOrb";
import { LEVEL_OPTIONS, ROUTES, TOPIC_OPTIONS } from "@/lib/constants";
import type { LevelId } from "@/lib/constants";
import { cn } from "@/lib/cn";
import type { OnboardingScreen } from "@/hooks/useOnboardingScreen";
import { HmatFileInput } from "@/components/screens/hmat/HmatChrome";

/** Hmat onboarding — the same flow in tactile material. */
function Chip({
  on,
  children,
  onClick,
  pressed,
}: {
  on: boolean;
  children: React.ReactNode;
  onClick: () => void;
  pressed?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={pressed}
      className={cn(
        "rounded-full border px-3.5 py-1.5 font-sans text-xs transition",
        on ? "border-accent bg-accent/[0.12] text-accent" : "border-border bg-card text-muted-foreground",
      )}
    >
      {children}
    </button>
  );
}

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-display text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
      {children}
    </p>
  );
}

export function HmatOnboarding({ screen }: { screen: OnboardingScreen }) {
  if (!screen.ready) {
    return (
      <div className="flex flex-1 items-center justify-center font-display text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        Načítání…
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col items-center gap-3 text-center">
        <div className="mat-recess flex w-full flex-col items-center px-4 py-6">
          <HmatOrb state="idle" size={120} />
        </div>
        <p className="font-display text-[10px] uppercase tracking-[0.2em] text-accent">Vítej</p>
        <h1 className="font-display text-lg tracking-[0.08em]">Ahoj! Jsem Honza</h1>
        <p className="mx-auto max-w-[300px] font-sans text-[13px] leading-relaxed text-muted-foreground">
          Řekni mi, o čem si chceš povídat a kolik umíš česky — a já ti napíšu první.
        </p>
      </header>

      <section className="mat space-y-3 px-4 py-4">
        <Heading>Tvoje úroveň češtiny</Heading>
        <p className="font-sans text-xs text-muted-foreground">
          Honza podle ní přizpůsobí slovní zásobu a opravy.
        </p>
        <div className="flex flex-wrap gap-2">
          {LEVEL_OPTIONS.map((l) => (
            <Chip
              key={l.id}
              on={screen.level === l.id}
              pressed={screen.level === l.id}
              onClick={() => screen.chooseLevel(l.id as LevelId)}
            >
              {l.label}
            </Chip>
          ))}
        </div>
      </section>

      <section className="mat space-y-3 px-4 py-4">
        <Heading>Témata</Heading>
        <p className="font-sans text-xs text-muted-foreground">Vyber oblasti, které tě zajímají.</p>
        <div className="flex flex-wrap gap-2">
          {TOPIC_OPTIONS.map((t) => (
            <Chip
              key={t.id}
              on={screen.topics.includes(t.id)}
              onClick={() => screen.toggleTopic(t.id)}
            >
              {t.label}
            </Chip>
          ))}
        </div>
      </section>

      <section className="mat space-y-3 px-4 py-4">
        <Heading>Kontext · Google Doc</Heading>
        <p className="font-sans text-xs leading-relaxed text-muted-foreground">
          Poznámky, slovíčka, cokoli se učíš. Nastav dokument na Sdílet → Kdokoli s
          odkazem → Čtenář.
        </p>
        <input
          value={screen.docUrl}
          onChange={(e) => screen.setDocUrl(e.target.value)}
          placeholder="https://docs.google.com/document/d/…"
          aria-label="Google Doc URL"
          className="mat-field w-full rounded-[14px] bg-transparent px-3.5 py-2.5 font-sans text-sm text-foreground outline-none"
        />
        {screen.docError ? <p className="font-sans text-xs text-accent">{screen.docError}</p> : null}
        <button
          type="button"
          onClick={screen.importGoogleDoc}
          disabled={screen.docLoading}
          className="mat-key press w-full rounded-[14px] py-2.5 font-display text-[11px] uppercase tracking-[0.14em] text-accent disabled:opacity-40"
        >
          {screen.docLoading ? "Načítám…" : "Přidat dokument"}
        </button>
      </section>

      <section className="mat space-y-3 px-4 py-4">
        <Heading>Soubor nebo text</Heading>
        <div className="space-y-1.5">
          <p className="font-sans text-xs text-muted-foreground">Soubor (.txt, .md)</p>
          <HmatFileInput onFile={screen.onFile} />
        </div>
        <textarea
          value={screen.paste}
          onChange={(e) => screen.setPaste(e.target.value)}
          rows={4}
          placeholder="Cokoli, co by o tobě Honza měl vědět…"
          aria-label="Pasted text"
          className="mat-field w-full resize-none rounded-[14px] bg-transparent px-3.5 py-2.5 font-sans text-sm text-foreground outline-none"
        />
        {screen.fileError ? <p className="font-sans text-xs text-accent">{screen.fileError}</p> : null}
        <button
          type="button"
          onClick={screen.addPaste}
          className="mat-key press w-full rounded-[14px] py-2.5 font-display text-[11px] uppercase tracking-[0.14em] text-accent"
        >
          Přidat text
        </button>
      </section>

      <button
        type="button"
        onClick={screen.finish}
        className="mat-key press w-full rounded-full py-3.5 font-display text-xs uppercase tracking-[0.18em] text-accent"
      >
        Začít mluvit s Honzou
      </button>

      <p className="text-center font-sans text-xs text-muted-foreground">
        Už nastaveno?{" "}
        <Link href={ROUTES.settings} className="text-accent underline">
          Nastavení
        </Link>
      </p>
    </div>
  );
}
