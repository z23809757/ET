/**
 * src/components/ui/AnimatedNumber.tsx
 *
 * Smoothly counts from 0 (or previous value) to the target `value`.
 * Uses Framer Motion's useSpring + useTransform to drive the display.
 * Accepts a `format` function so callers can pass formatUSD / formatINR
 * or any arbitrary formatter without knowing about the count mechanism.
 *
 * Respects prefers-reduced-motion: if reduced, just displays the value.
 */

import React, { useEffect, useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  animate,
} from "framer-motion";
import { cn } from "../../lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AnimatedNumberProps {
  value:      number;
  format?:    (n: number) => string;
  /** Duration in seconds (default 1.2) */
  duration?:  number;
  /** Delay before animation starts in seconds (default 0) */
  delay?:     number;
  className?: string;
  /** If true, shows the final value immediately without animation */
  static?:    boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const defaultFormat = (n: number) =>
  n.toLocaleString("en-US", { maximumFractionDigits: 2 });

// ─── Component ────────────────────────────────────────────────────────────────

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  format    = defaultFormat,
  duration  = 1.2,
  delay     = 0,
  className,
  static:   isStatic = false,
}) => {
  // Respect OS preference
  const prefersReduced =
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

  const motionVal = useMotionValue(0);
  const displayRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (isStatic || prefersReduced) {
      if (displayRef.current) {
        displayRef.current.textContent = format(value);
      }
      return;
    }

    const controls = animate(motionVal, value, {
      duration,
      delay,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => {
        if (displayRef.current) {
          displayRef.current.textContent = format(latest);
        }
      },
    });

    return controls.stop;
  }, [value, duration, delay, format, isStatic, prefersReduced]);

  if (isStatic || prefersReduced) {
    return (
      <span className={cn(className)}>
        {format(value)}
      </span>
    );
  }

  return (
    <span
      ref={displayRef}
      className={cn(className)}
      aria-live="polite"
      aria-atomic="true"
    >
      {format(0)}
    </span>
  );
};

export default AnimatedNumber;

// ─────────────────────────────────────────────────────────────────────────────
// Usage
// ─────────────────────────────────────────────────────────────────────────────
//
// import { formatUSD } from "../../lib/formatters";
//
// <AnimatedNumber
//   value={142850}
//   format={formatUSD}
//   duration={1.4}
//   delay={0.1}
//   className="text-4xl font-bold text-white tabular"
// />
//
// Staggered cards (each card delays by index * 0.08):
// metrics.map((m, i) => (
//   <StatCard key={m.id} ... animDelay={i * 0.08} />
// ))