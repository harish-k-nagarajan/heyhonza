/**
 * Concrete clock times for specific-mode check-ins.
 * Shared by Settings, onboarding, and the server scheduler.
 */

const MINUTES_IN_DAY = 24 * 60;

/** `HH:MM` from an `<input type="time">` value, or null when it isn't a clock time. */
export function normalizeHm(value: string | null | undefined): string | null {
  if (!value) return null;
  const match = /^(\d{1,2}):(\d{2})/.exec(value.trim());
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) return null;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function toMinutes(hm: string): number {
  const [h, m] = hm.split(":");
  return Number(h) * 60 + Number(m);
}

function fromMinutes(total: number): string {
  const capped = Math.min(MINUTES_IN_DAY - 1, Math.max(0, total));
  return `${String(Math.floor(capped / 60)).padStart(2, "0")}:${String(capped % 60).padStart(2, "0")}`;
}

/**
 * The times Honza should write, length `count` (1–3).
 * A blank second or third time lands 4h / 8h after the first, and won't share a minute with an earlier default.
 */
export function specificMessageTimes(opts: {
  count: number;
  first: string;
  second?: string | null;
  third?: string | null;
}): string[] {
  const count = opts.count === 2 || opts.count === 3 ? opts.count : 1;
  const first = normalizeHm(opts.first) ?? "09:00";
  const chosen = [first, normalizeHm(opts.second), normalizeHm(opts.third)];
  const gaps = [0, 4 * 60, 8 * 60];
  const used = new Set<number>();
  const out: string[] = [];

  for (let i = 0; i < count; i++) {
    const explicit = chosen[i];
    let mins = explicit ? toMinutes(explicit) : toMinutes(first) + gaps[i];
    mins = Math.min(MINUTES_IN_DAY - 1, Math.max(0, mins));
    if (!explicit) {
      while (used.has(mins) && mins < MINUTES_IN_DAY - 1) mins += 15;
      while (used.has(mins) && mins > 0) mins -= 15;
    }
    used.add(mins);
    out.push(fromMinutes(mins));
  }

  return out;
}
