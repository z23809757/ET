/**
 * src/hooks/useMediaQuery.ts
 *
 * Reactive hook that returns true/false for a CSS media query string.
 * SSR-safe: defaults to false on the server.
 *
 * Pre-built breakpoint hooks:
 *   useMobile()  → < 640px
 *   useTablet()  → 640–1023px
 *   useDesktop() → ≥ 1024px
 */

import { useState, useEffect } from "react";

// ─── Core hook ────────────────────────────────────────────────────────────────

export function useMediaQuery(query: string): boolean {
  const getMatch = () =>
    typeof window !== "undefined"
      ? window.matchMedia(query).matches
      : false;

  const [matches, setMatches] = useState<boolean>(getMatch);

  useEffect(() => {
    const mql      = window.matchMedia(query);
    const handler  = (e: MediaQueryListEvent) => setMatches(e.matches);

    // Modern browsers
    if (mql.addEventListener) {
      mql.addEventListener("change", handler);
      return () => mql.removeEventListener("change", handler);
    } else {
      // Safari < 14 fallback
      mql.addListener(handler);
      return () => mql.removeListener(handler);
    }
  }, [query]);

  return matches;
}

// ─── Breakpoint shortcuts ─────────────────────────────────────────────────────

/** true when viewport < 640px */
export const useMobile  = () => useMediaQuery("(max-width: 639px)");

/** true when 640px ≤ viewport < 1024px */
export const useTablet  = () => useMediaQuery("(min-width: 640px) and (max-width: 1023px)");

/** true when viewport ≥ 1024px */
export const useDesktop = () => useMediaQuery("(min-width: 1024px)");

/** true when user prefers reduced motion */
export const usePrefersReducedMotion = () =>
  useMediaQuery("(prefers-reduced-motion: reduce)");

/** true when user prefers dark mode (when we add a manual theme toggle) */
export const usePrefersDark = () =>
  useMediaQuery("(prefers-color-scheme: dark)");

export default useMediaQuery;

// ─────────────────────────────────────────────────────────────────────────────
// Usage
// ─────────────────────────────────────────────────────────────────────────────
//
// const isMobile  = useMobile();
// const isDesktop = useDesktop();
//
// // In AppShell: overlay drawer on mobile vs persistent sidebar on desktop
// <Sidebar overlay={isMobile} ... />
//
// // In DashboardView: 1-col on mobile, 2-col on tablet, 4-col on desktop
// <div className={cn(
//   "grid gap-4",
//   isMobile  && "grid-cols-1",
//   isTablet  && "grid-cols-2",
//   isDesktop && "grid-cols-4",
// )}>