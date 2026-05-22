/**
 * src/components/ui/PageTransition.tsx
 *
 * Wraps each "page" (view) with a Framer Motion animated container.
 * Use inside AnimatePresence in App.tsx/AppShell.tsx.
 *
 * The key prop must change between views so AnimatePresence knows to
 * animate the exit of the old view before mounting the new one.
 *
 * Usage in AppShell.tsx:
 *
 *   import { AnimatePresence } from "framer-motion";
 *   import PageTransition from "../ui/PageTransition";
 *
 *   <AnimatePresence mode="wait">
 *     <PageTransition key={activeView}>
 *       {activeView === "dashboard" && <DashboardView ... />}
 *       {activeView === "overall"   && <OverallView   ... />}
 *       ...
 *     </PageTransition>
 *   </AnimatePresence>
 */

import React from "react";
<<<<<<< HEAD
import { motion } from "framer-motion";
=======
import { motion, type TargetAndTransition, type Transition } from "framer-motion";
>>>>>>> eead2da (Small Changes)
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
<<<<<<< HEAD
  initial: object; animate: object; exit: object; transition: object;
=======
  initial: TargetAndTransition; animate: TargetAndTransition; exit: TargetAndTransition; transition: Transition;
>>>>>>> eead2da (Small Changes)
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

<<<<<<< HEAD
export default PageTransition;
=======
export default PageTransition;
>>>>>>> eead2da (Small Changes)
