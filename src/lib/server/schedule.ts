import "server-only";

/**
 * Compute today's check-in slot instants in UTC for a learner's timezone.
 * Specific mode: first slot at `firstMessageTime`, remaining slots spread ~4h.
 * Random mode: stable per (user, local date) between 08:00 and 21:00.
 */

export type ScheduleMode = "specific" | "random";

function hash32(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function partsInZone(
  timeZone: string,
  date: Date,
): { year: number; month: number; day: number; hour: number; minute: number } {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const map: Record<string, string> = {};
  for (const p of fmt.formatToParts(date)) {
    if (p.type !== "literal") map[p.type] = p.value;
  }
  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    hour: Number(map.hour),
    minute: Number(map.minute),
  };
}

/** Instant for Y-M-D H:M in a zone. */
export function zonedLocalTime(
  timeZone: string,
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
): Date {
  const utcGuess = Date.UTC(year, month - 1, day, hour, minute, 0);
  const asZone = partsInZone(timeZone, new Date(utcGuess));
  const wanted = Date.UTC(year, month - 1, day, hour, minute, 0);
  const got = Date.UTC(
    asZone.year,
    asZone.month - 1,
    asZone.day,
    asZone.hour,
    asZone.minute,
    0,
  );
  return new Date(utcGuess + (wanted - got));
}

function parseHm(value: string): { hour: number; minute: number } {
  const [h, m] = value.split(":");
  const hour = Math.min(23, Math.max(0, Number(h) || 0));
  const minute = Math.min(59, Math.max(0, Number(m) || 0));
  return { hour, minute };
}

export function slotsForLocalDay(opts: {
  userId: string;
  timeZone: string;
  now: Date;
  count: number;
  mode: ScheduleMode;
  firstMessageTime: string;
}): Date[] {
  const tz = opts.timeZone || "UTC";
  const local = partsInZone(tz, opts.now);
  const n = Math.min(3, Math.max(1, opts.count));
  const minutes: number[] = [];

  if (opts.mode === "specific") {
    const first = parseHm(opts.firstMessageTime);
    const start = first.hour * 60 + first.minute;
    minutes.push(start);
    const gap = 4 * 60;
    for (let i = 1; i < n; i++) {
      minutes.push(Math.min(start + gap * i, 21 * 60));
    }
  } else {
    const seed = hash32(`${opts.userId}:${local.year}-${local.month}-${local.day}`);
    const windowStart = 8 * 60;
    const windowEnd = 21 * 60;
    const span = windowEnd - windowStart;
    const used = new Set<number>();
    let x = seed;
    while (minutes.length < n) {
      x = (Math.imul(x, 1103515245) + 12345) >>> 0;
      const mins = windowStart + (x % span);
      const bucket = Math.round(mins / 15) * 15;
      if (used.has(bucket)) continue;
      used.add(bucket);
      minutes.push(bucket);
    }
    minutes.sort((a, b) => a - b);
  }

  return minutes.map((mins) =>
    zonedLocalTime(tz, local.year, local.month, local.day, Math.floor(mins / 60), mins % 60),
  );
}

/** Slots that should have fired by `now`, within a catch-up window. */
export function dueSlots(slots: Date[], now: Date, graceMs = 26 * 60 * 60 * 1000): Date[] {
  return slots.filter((slot) => {
    const t = slot.getTime();
    return t <= now.getTime() && now.getTime() - t <= graceMs;
  });
}

/**
 * Today's slots plus yesterday's, so a once-daily Hobby cron still catches a
 * 09:00 UTC default that Vercel's 08:00 UTC job would otherwise skip forever.
 */
export function slotsDueForCheckIn(
  opts: Parameters<typeof slotsForLocalDay>[0],
  now: Date,
  graceMs = 26 * 60 * 60 * 1000,
): Date[] {
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const seen = new Set<string>();
  const candidates = [
    ...slotsForLocalDay({ ...opts, now: yesterday }),
    ...slotsForLocalDay({ ...opts, now }),
  ];
  const unique: Date[] = [];
  for (const slot of candidates) {
    const key = slot.toISOString();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(slot);
  }
  return dueSlots(unique, now, graceMs);
}
