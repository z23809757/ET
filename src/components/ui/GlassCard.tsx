/**
 * src/components/ui/GlassCard.tsx
 *
 * Reusable glassmorphism card. Supports 4 visual variants, 3 size presets,
 * per-card accent color, optional 3-D tilt on hover, mouse-tracking glare,
 * and a pulsing border shimmer for the "accent" variant.
 *
 * All animation is driven by Framer Motion. Respects prefers-reduced-motion
 * via the `static` prop (or set it globally via AnimatePresence).
 */

import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { COLORS, GLASS, EASING } from "../../lib/theme";
import { cn } from "../../lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export type GlassCardVariant = "default" | "elevated" | "subtle" | "accent";
export type GlassCardSize    = "sm" | "md" | "lg";

export interface GlassCardProps {
  children:     React.ReactNode;
  variant?:     GlassCardVariant;
  size?:        GlassCardSize;
  /** CSS color — drives glow, shimmer, and accent border */
  accentColor?: string;
  /** Enable 3-D magnetic tilt on hover (default: true) */
  tilt?:        boolean;
  /** Disable all motion (SSR / reduced-motion) */
  static?:      boolean;
  /** Extra class names */
  className?:   string;
  /** Makes card clickable */
  onClick?:     React.MouseEventHandler<HTMLDivElement>;
  role?:        string;
  "aria-label"?:string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SIZE_PAD: Record<GlassCardSize, string> = {
  sm: "p-4",
  md: "p-5",
  lg: "p-7",
};

const VARIANT_CLASS: Record<GlassCardVariant, string> = {
  default:  "bg-glass border-glass-border shadow-glass",
  elevated: "bg-glass-elevated border-glass-border-hi shadow-glass-lg",
  subtle:   "bg-glass-faint border-white/5 shadow-sm",
  accent:   "bg-glass border-glass-border shadow-glass",
};

// ─── Component ────────────────────────────────────────────────────────────────

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  variant      = "default",
  size         = "md",
  accentColor  = COLORS.accent.blue,
  tilt         = true,
  static:      isStatic = false,
  className    = "",
  onClick,
  role,
  "aria-label": ariaLabel,
}) => {
  const ref        = useRef<HTMLDivElement>(null);
  const doTilt     = tilt && !isStatic;
  const springCfg  = { stiffness: 260, damping: 22, mass: 0.6 };

  // Pointer position (–0.5 → +0.5)
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  // Smooth tilt angles (degrees)
  const rotateX = useSpring(useTransform(rawY, [-0.5, 0.5], [7, -7]), springCfg);
  const rotateY = useSpring(useTransform(rawX, [-0.5, 0.5], [-7, 7]), springCfg);

  // Glare position + opacity
  const glareX   = useTransform(rawX, [-0.5, 0.5], ["0%", "100%"]);
  const glareY   = useTransform(rawY, [-0.5, 0.5], ["0%", "100%"]);
  const glareOpacity = useSpring(0, { stiffness: 180, damping: 28 });
<<<<<<< HEAD
=======
  const glareBackground = useTransform(
    [glareX, glareY],
    ([x, y]: string[]) =>
      `radial-gradient(circle at ${x} ${y}, rgba(255,255,255,0.5) 0%, transparent 62%)`,
  );
>>>>>>> eead2da (Small Changes)

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!doTilt || !ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    rawX.set((e.clientX - left) / width  - 0.5);
    rawY.set((e.clientY - top)  / height - 0.5);
    glareOpacity.set(0.16);
  };

  const onMouseLeave = () => {
    rawX.set(0);
    rawY.set(0);
    glareOpacity.set(0);
  };

  return (
    <motion.div
      ref={ref}
      role={role}
      aria-label={ariaLabel}
      onClick={onClick}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{
        rotateX:          doTilt ? rotateX : 0,
        rotateY:          doTilt ? rotateY : 0,
        transformStyle:   "preserve-3d",
        transformPerspective: 900,
      } as React.CSSProperties}
      initial={isStatic ? false : { opacity: 0, y: 14 }}
      animate={isStatic ? {}      : { opacity: 1, y: 0  }}
      transition={{ duration: 0.45, ease: EASING.spring }}
      whileHover={isStatic ? {} : {
        scale: 1.016,
        boxShadow: `0 20px 52px rgba(0,0,0,0.42), 0 0 0 1px ${accentColor}40`,
      }}
      whileTap={onClick && !isStatic ? { scale: 0.984 } : {}}
      className={cn(
        // Layout
        "relative isolate overflow-hidden rounded-2xl border",
        // Glass layer
        "backdrop-blur-lg backdrop-saturate-150",
        // Variant
        VARIANT_CLASS[variant],
        // Size
        SIZE_PAD[size],
        // Cursor
        onClick ? "cursor-pointer select-none" : "",
        className,
      )}
    >
      {/* Noise grain */}
      <div aria-hidden className="noise-overlay z-0" />

      {/* Top-edge highlight */}
      <div
        aria-hidden
        className="top-shimmer z-10"
        style={{
          background: `linear-gradient(90deg,
            transparent 0%,
            ${accentColor}55 38%,
            rgba(255,255,255,0.65) 52%,
            ${accentColor}55 66%,
            transparent 100%
          )`,
        }}
      />

      {/* Corner accent glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-10 -right-10 z-0 h-44 w-44 rounded-full blur-3xl"
        style={{ background: accentColor, opacity: 0.15 }}
      />

      {/* Accent variant — pulsing inset border */}
      {variant === "accent" && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-2xl z-10"
          animate={{
            boxShadow: [
              `inset 0 0 0 1px ${accentColor}22`,
              `inset 0 0 0 1px ${accentColor}60`,
              `inset 0 0 0 1px ${accentColor}22`,
            ],
          }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* Mouse-tracking glare */}
      {doTilt && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-2xl z-20"
          style={{
            opacity: glareOpacity,
<<<<<<< HEAD
            background: useTransform(
              [glareX, glareY],
              ([x, y]: string[]) =>
                `radial-gradient(circle at ${x} ${y}, rgba(255,255,255,0.5) 0%, transparent 62%)`,
            ),
=======
            background: glareBackground,
>>>>>>> eead2da (Small Changes)
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-30">{children}</div>
    </motion.div>
  );
};

<<<<<<< HEAD
export default GlassCard;
=======
export default GlassCard;
>>>>>>> eead2da (Small Changes)
