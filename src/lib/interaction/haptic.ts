/**
 * Light haptic feedback for tactile controls. No-ops when the Vibration API is
 * unavailable (desktop, unsupported browsers, or user OS setting off).
 */

function vibrate(pattern: number | number[]): void {
  if (typeof navigator === "undefined") return;
  if (!("vibrate" in navigator)) return;
  try {
    navigator.vibrate(pattern);
  } catch {
    /* ignore */
  }
}

/** Tab press, mat-key tap, orb tap. */
export function tapLight(): void {
  vibrate(8);
}

/** Send message, call connect. */
export function tapMedium(): void {
  vibrate([12, 40, 12]);
}

/** Mood → excited, successful send confirmation. */
export function hapticSuccess(): void {
  vibrate([10, 30, 10, 30, 18]);
}

/** Mood → oops — gentle bump. */
export function hapticOops(): void {
  vibrate([6, 20, 6]);
}

/** Attach light haptic to a click/pointer handler. */
export function withTapLight<T extends (...args: never[]) => void>(
  fn: T,
): (...args: Parameters<T>) => void {
  return (...args: Parameters<T>) => {
    tapLight();
    fn(...args);
  };
}
