"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/cn";
import { MODEL_OPTIONS, type ModelOptionId } from "@/lib/constants";
import { TYPE } from "@/lib/design/typography";

export type PickerModel = {
  id: string;
  label: string;
  free: boolean;
  blurb: string;
};

function DottedChevron() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
      <rect x="1" y="2" width="2" height="2" rx="0.4" fill="currentColor" />
      <rect x="5" y="2" width="2" height="2" rx="0.4" fill="currentColor" />
      <rect x="9" y="2" width="2" height="2" rx="0.4" fill="currentColor" />
      <rect x="3" y="6" width="2" height="2" rx="0.4" fill="currentColor" />
      <rect x="7" y="6" width="2" height="2" rx="0.4" fill="currentColor" />
      <rect x="5" y="10" width="2" height="2" rx="0.4" fill="currentColor" />
    </svg>
  );
}

function SearchGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="2" />
      <path d="m16 16 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function curatedPickerModels(blurb: Record<ModelOptionId, string>): PickerModel[] {
  return MODEL_OPTIONS.map((m) => ({
    id: m.id,
    label: m.label,
    free: m.free,
    blurb: blurb[m.id],
  }));
}

export function HmatModelPicker({
  value,
  onChange,
  options,
  searchLabel,
  emptyLabel,
  freeLabel,
  ariaLabel,
}: {
  value: string;
  onChange: (id: string) => void;
  options: PickerModel[];
  searchLabel: string;
  emptyLabel: string;
  freeLabel: string;
  ariaLabel: string;
}) {
  const listId = useId();
  const searchId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const selected = options.find((m) => m.id === value) ?? {
    id: value,
    label: value,
    free: false,
    blurb: "",
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((m) =>
      `${m.label} ${m.blurb} ${m.id}`.toLowerCase().includes(q),
    );
  }, [options, query]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActive(0);
  }, []);

  const openMenu = () => {
    setQuery("");
    setActive(0);
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) close();
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open, close]);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => searchRef.current?.focus(), 20);
    return () => window.clearTimeout(t);
  }, [open]);

  const choose = (id: string) => {
    onChange(id);
    close();
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => (open ? close() : openMenu())}
        className="hmat-frost-field flex min-h-[52px] w-full items-center gap-2.5 px-3.5 text-left"
      >
        <span className="min-w-0 flex-1">
          <span className="block truncate font-display text-[13px] tracking-[0.04em] text-[#243D2C]">
            {selected.label}
            {selected.free ? (
              <span className="ml-1.5 font-sans text-[10px] tracking-normal text-[#6E8A74]">
                · {freeLabel}
              </span>
            ) : null}
          </span>
          {selected.blurb ? (
            <span className="mt-0.5 block truncate font-sans text-[11px] text-[#9c9089]">
              {selected.blurb}
            </span>
          ) : null}
        </span>
        <span className="shrink-0 text-[#9c9089]" aria-hidden>
          <DottedChevron />
        </span>
      </button>

      <div
          id={listId}
          role="listbox"
          aria-label={ariaLabel}
          data-origin="top-left"
          data-open={open ? "true" : "false"}
          inert={!open}
          className="hmat-model-menu absolute left-0 right-0 z-30 mt-1.5 overflow-hidden rounded-[16px]"
        >
          <div className="flex items-center gap-2 border-b border-black/[0.06] px-3 py-2">
            <span className="text-[#9c9089]">
              <SearchGlyph />
            </span>
            <input
              ref={searchRef}
              id={searchId}
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.preventDefault();
                  close();
                  return;
                }
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setActive((i) => Math.min(i + 1, Math.max(filtered.length - 1, 0)));
                  return;
                }
                if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setActive((i) => Math.max(i - 1, 0));
                  return;
                }
                if (e.key === "Enter") {
                  e.preventDefault();
                  const hit = filtered[active];
                  if (hit) choose(hit.id);
                }
              }}
              placeholder={searchLabel}
              aria-label={searchLabel}
              className="min-w-0 flex-1 bg-transparent font-sans text-sm text-[#243D2C] outline-none placeholder:text-[#9c9089]"
            />
          </div>
          <ul className="max-h-[260px] overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className={cn(TYPE.helper, "px-3.5 py-3")}>{emptyLabel}</li>
            ) : (
              filtered.map((m, i) => {
                const on = m.id === value;
                const hi = i === active;
                return (
                  <li key={m.id} role="option" aria-selected={on}>
                    <button
                      type="button"
                      onMouseEnter={() => setActive(i)}
                      onClick={() => choose(m.id)}
                      className={cn(
                        "flex w-full flex-col items-start px-3.5 py-2.5 text-left",
                        hi ? "bg-[#FFE5DC]/70" : "bg-transparent",
                      )}
                    >
                      <span className="font-display text-[13px] tracking-[0.04em] text-[#243D2C]">
                        {m.label}
                        {m.free ? (
                          <span className="ml-1.5 font-sans text-[10px] tracking-normal text-[#6E8A74]">
                            · {freeLabel}
                          </span>
                        ) : null}
                      </span>
                      {m.blurb ? (
                        <span className="mt-0.5 font-sans text-[11px] text-[#9c9089]">
                          — {m.blurb}
                        </span>
                      ) : null}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
    </div>
  );
}
