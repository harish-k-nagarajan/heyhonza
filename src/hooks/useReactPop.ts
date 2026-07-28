"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const POP_MS = 550;

/**
 * Toggles the orb react-pop class for one animation cycle. Used when Honza
 * reacts to send, mood beats, call connect, or an orb tap.
 */
export function useReactPop() {
  const [popping, setPopping] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const triggerPop = useCallback(() => {
    clearTimer();
    setPopping(true);
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      setPopping(false);
    }, POP_MS);
  }, [clearTimer]);

  useEffect(() => () => clearTimer(), [clearTimer]);

  return {
    popping,
    stackClassName: popping ? "react-pop" : undefined,
    triggerPop,
  };
}
