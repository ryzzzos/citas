"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Listens to a CSS media query and returns whether it currently matches.
 * Uses useSyncExternalStore to subscribe to matchMedia changes safely without triggering effect state warnings.
 *
 * @example
 * const isDesktop = useMediaQuery("(min-width: 640px)");
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (callback: () => void) => {
      if (typeof window === "undefined") {
        return () => {};
      }
      const mql = window.matchMedia(query);
      mql.addEventListener("change", callback);
      return () => mql.removeEventListener("change", callback);
    },
    [query]
  );

  const getSnapshot = useCallback(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return window.matchMedia(query).matches;
  }, [query]);

  const getServerSnapshot = useCallback(() => false, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

