"use client";
import { useCallback, useEffect, useRef } from "react";

export function useDebouncedCallback<Args extends unknown[]>(
  fn: (...args: Args) => void,
  wait: number
) {
  const fnRef = useRef(fn);
  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  const timerRef = useRef<ReturnType<typeof globalThis.setTimeout> | null>(null);

  const debounced = useCallback((...args: Args) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = globalThis.setTimeout(() => fnRef.current(...args), wait);
  }, [wait]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return debounced;
}
