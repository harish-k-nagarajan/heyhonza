"use client";

import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { HmatOrb } from "@/components/honza/HmatOrb";
import { LEVEL_OPTIONS, ROUTES, TOPIC_OPTIONS } from "@/lib/constants";
import type { LevelId } from "@/lib/constants";
import { cn } from "@/lib/cn";
import { TYPE } from "@/lib/design/typography";
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
  return <p className={cn(TYPE.label, "text-muted-foreground")}>{children}</p>;
}

export function HmatOnboarding({ screen }: { screen: OnboardingScreen }) {
  if (!screen.ready) {
    return (
      <div
        className={cn(
          "flex flex-1 items-center justify-center uppercase text-muted-foreground",
          TYPE.meta,
        )}
      >
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
        <p className={cn(TYPE.label, "text-accent")}>Vítej</p>
        <h1 className={TYPE.title}>Ahoj! Jsem Honza</h1>
        <p className={cn("mx-auto max-w-[300px]", TYPE.subtitle)}>
          Řekni mi, o čem si chceš povídat a kolik umíš česky — a já ti napíšu první.
        </p>
      </header>

      <section className="mat space-y-3 px-4 py-4">
        <Heading>Tvoje úroveň češtiny</Heading>
        <p className={TYPE.helper}>
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
        <p className={TYPE.helper}>Vyber oblasti, které tě zajímají.</p>
        <div className="flex flex-wrap gap-2">
          {TOPIC_OPTIONS.map((topic) => (
            <Chip
              key={topic.id}
              on={screen.topics.includes(topic.id)}
              onClick={() => screen.toggleTopic(topic.id)}
            >
              {topic.label}
            </Chip>
          ))}
        </div>
      </section>

      <section className="mat space-y-3 px-4 py-4">
        <Heading>Kontext · Google Doc</Heading>
        <p className={TYPE.helper}>
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
        {screen.docError ? (
          <p className={cn(TYPE.helper, "text-accent")}>{screen.docError}</p>
        ) : null}
        <Button
          type="button"
          surface="mat-key"
          shape="card"
          size="md"
          onClick={screen.importGoogleDoc}
          disabled={screen.docLoading}
        >
          {screen.docLoading ? "Načítám…" : "Přidat dokument"}
        </Button>
      </section>

      <section className="mat space-y-3 px-4 py-4">
        <Heading>Soubor nebo text</Heading>
        <div className="space-y-1.5">
          <p className={TYPE.helper}>Soubor (.txt, .md)</p>
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
        {screen.fileError ? (
          <p className={cn(TYPE.helper, "text-accent")}>{screen.fileError}</p>
        ) : null}
        <Button type="button" surface="mat-key" shape="card" size="md" onClick={screen.addPaste}>
          Přidat text
        </Button>
      </section>

      <Button type="button" surface="mat-key" shape="pill" size="lg" onClick={screen.finish}>
        Začít mluvit s Honzou
      </Button>

      <p className={cn("text-center", TYPE.helper)}>
        Už nastaveno?{" "}
        <Link href={ROUTES.settings} className="text-accent underline">
          Nastavení
        </Link>
      </p>
    </div>
  );
}
