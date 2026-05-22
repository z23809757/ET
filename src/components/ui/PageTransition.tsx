
import React from "react";
import { motion } from "framer-motion";
import { EASING } from "../../lib/theme";
import { cn } from "../../lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export type TransitionStyle = "fadeUp" | "fade" | "slideLeft" | "scale";

export interface PageTransitionProps {
  children:   React.ReactNode;
  style?:     TransitionStyle;
  className?: string;
}

// ─── Variant presets ──────────────────────────────────────────────────────────

const VARIANTS: Record<TransitionStyle, {
  initial: object; animate: object; exit: object; transition: object;
}> = {
  fadeUp: {
    initial:    { opacity: 0, y: 16 },
    animate:    { opacity: 1, y:  0 },
    exit:       { opacity: 0, y: -8 },
    transition: { duration: 0.35, ease: EASING.spring },
  },
  fade: {
    initial:    { opacity: 0 },
    animate:    { opacity: 1 },
    exit:       { opacity: 0 },
    transition: { duration: 0.22 },
  },
  slideLeft: {
    initial:    { opacity: 0, x: 24 },
    animate:    { opacity: 1, x:  0 },
    exit:       { opacity: 0, x: -16 },
    transition: { duration: 0.32, ease: EASING.spring },
  },
  scale: {
    initial:    { opacity: 0, scale: 0.97 },
    animate:    { opacity: 1, scale: 1    },
    exit:       { opacity: 0, scale: 0.98 },
    transition: { duration: 0.25, ease: EASING.spring },
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  style     = "fadeUp",
  className,
}) => {
  const v = VARIANTS[style];

  return (
    <motion.div
      initial={v.initial}
      animate={v.animate}
      exit={v.exit}
      transition={v.transition}
      className={cn("w-full h-full", className)}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;