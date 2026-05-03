"use client";

import * as React from "react";

/**
 * SSR-safe localStorage hook.
 *
 * Returns the default value during server render and during the first client
 * render (to avoid hydration mismatches), then asynchronously hydrates to the
 * persisted value on mount.
 */
export function useLocalStorage(
  key: string,
  defaultValue: string,
): [string, (value: string) => void] {
  const [value, setValue] = React.useState<string>(defaultValue);

  // After mount, read from localStorage and update if different.
  // Using a flushSync-free pattern with a ref guard so we only ever read once.
  const hasHydrated = React.useRef(false);
  React.useEffect(() => {
    if (hasHydrated.current) return;
    hasHydrated.current = true;
    try {
      const stored = window.localStorage.getItem(key);
      if (stored !== null && stored !== value) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setValue(stored);
      }
    } catch {
      // ignore — localStorage may be unavailable
    }
  }, [key, value]);

  const persist = React.useCallback(
    (next: string) => {
      setValue(next);
      try {
        if (next === "" || next === undefined || next === null) {
          window.localStorage.removeItem(key);
        } else {
          window.localStorage.setItem(key, next);
        }
      } catch {
        // ignore
      }
    },
    [key],
  );

  return [value, persist];
}
