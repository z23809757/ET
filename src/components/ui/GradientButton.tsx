/**
 * src/components/ui/GradientButton.tsx
 *
 * Premium button with gradient variants, hover glow, tap feedback, and
 * a loading spinner. Replaces the current shared/Button.tsx.
 *
 * Variants:
 *  emerald   → emerald → cyan   (primary actions: "Save", "Add", "Create")
 *  gold      → gold → amber     (highlights: "Export", "Backup")
 *  violet    → violet → blue    (secondary accents)
 *  coral     → coral → rose     (destructive: "Delete")
 *  ghost     → transparent + border (subtle/tertiary)
 *  glass     → glassmorphism surface (default toolbar button)
 */

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { COLORS, GRADIENTS, EASING } from "../../lib/theme";
import { cn } from "../../lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export type GradientButtonVariant =
  | "emerald" | "gold" | "violet" | "coral" | "ghost" | "glass";

export type GradientButtonSize = "xs" | "sm" | "md" | "lg";

export interface GradientButtonProps
  extends Omit<HTMLMotionProps<"button">, "children"> {
  children:  React.ReactNode;
  variant?:  GradientButtonVariant;
  size?:     GradientButtonSize;
  loading?:  boolean;
  icon?:     React.ReactNode;
  iconRight?:React.ReactNode;
  fullWidth?:boolean;
}

// ─── Variant configs ──────────────────────────────────────────────────────────

type VariantCfg = {
  bg:      string;          // background gradient or color
  hover:   string;          // hover box-shadow glow
  text:    string;
  border?: string;
};

const VARIANTS: Record<GradientButtonVariant, VariantCfg> = {
  emerald: {
    bg:    GRADIENTS.emeraldCyan,
    hover: `0 0 22px ${COLORS.accent.emeraldGlow}, 0 4px 16px rgba(0,0,0,0.28)`,
    text:  "#fff",
  },
  gold: {
    bg:    GRADIENTS.goldAmber,
    hover: `0 0 22px ${COLORS.accent.goldGlow}, 0 4px 16px rgba(0,0,0,0.28)`,
    text:  COLORS.bg.base,
  },
  violet: {
    bg:    GRADIENTS.violetBlue,
    hover: `0 0 22px ${COLORS.accent.violetGlow}, 0 4px 16px rgba(0,0,0,0.28)`,
    text:  "#fff",
  },
  coral: {
    bg:    GRADIENTS.coralRose,
    hover: `0 0 22px ${COLORS.accent.coralGlow}, 0 4px 16px rgba(0,0,0,0.28)`,
    text:  "#fff",
  },
  ghost: {
    bg:     "transparent",
    hover:  "0 0 0 1px rgba(255,255,255,0.22), 0 2px 10px rgba(0,0,0,0.18)",
    text:   COLORS.text.secondary,
    border: "rgba(255,255,255,0.14)",
  },
  glass: {
    bg:     COLORS.glass.default,
    hover:  "0 4px 24px rgba(0,0,0,0.3)",
    text:   COLORS.text.primary,
    border: COLORS.glass.border,
  },
};

const SIZE_STYLES: Record<GradientButtonSize, string> = {
  xs: "h-6  px-2.5 text-2xs gap-1",
  sm: "h-7  px-3   text-xs  gap-1.5",
  md: "h-8  px-4   text-base gap-2",
  lg: "h-10 px-5   text-md  gap-2",
};

// ─── Spinner ──────────────────────────────────────────────────────────────────

const Spinner: React.FC<{ color: string }> = ({ color }) => (
  <svg
    className="animate-spin w-3.5 h-3.5 flex-shrink-0"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden
  >
    <circle
      cx="12" cy="12" r="10"
      stroke={color}
      strokeOpacity="0.25"
      strokeWidth="3"
    />
    <path
      d="M12 2a10 10 0 0 1 10 10"
      stroke={color}
      strokeWidth="3"
      strokeLinecap="round"
    />
  </svg>
);

// ─── GradientButton ───────────────────────────────────────────────────────────

export const GradientButton: React.FC<GradientButtonProps> = ({
  children,
  variant   = "glass",
  size      = "md",
  loading   = false,
  icon,
  iconRight,
  fullWidth = false,
  disabled,
  className,
  ...rest
}) => {
  const cfg      = VARIANTS[variant];
  const isDisabled = disabled || loading;

  return (
    <motion.button
      {...rest}
      disabled={isDisabled}
      whileHover={isDisabled ? {} : { scale: 1.025 }}
      whileTap={isDisabled   ? {} : { scale: 0.965 }}
      transition={{ duration: 0.15, ease: EASING.spring }}
      className={cn(
        // Layout
        "relative inline-flex items-center justify-center rounded-xl font-medium",
        "transition-[box-shadow,filter] duration-150",
        "select-none outline-none overflow-hidden",
        "border",
        // Size
        SIZE_STYLES[size],
        // Width
        fullWidth ? "w-full" : "w-auto",
        // Disabled
        isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
        className,
      )}
      style={{
        background:   cfg.bg,
        color:        cfg.text,
        borderColor:  cfg.border ?? "transparent",
        backdropFilter: variant === "glass" ? "blur(16px)" : undefined,
      }}
      onMouseEnter={(e) => {
        if (!isDisabled) {
          (e.currentTarget as HTMLElement).style.boxShadow = cfg.hover;
        }
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "none";
      }}
    >
      {/* Shimmer overlay on gradient variants */}
      {variant !== "ghost" && variant !== "glass" && (
        <span
          aria-hidden
          className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300"
          style={{
            background:
              "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.18) 50%, transparent 70%)",
            backgroundSize: "200% 100%",
          }}
        />
      )}

      {/* Content */}
      <span className="relative z-10 inline-flex items-center gap-[inherit]">
        {loading ? (
          <Spinner color={cfg.text} />
        ) : icon ? (
          <span className="flex-shrink-0 w-[1em] h-[1em]">{icon}</span>
        ) : null}
        <span>{children}</span>
        {!loading && iconRight && (
          <span className="flex-shrink-0 w-[1em] h-[1em]">{iconRight}</span>
        )}
      </span>
    </motion.button>
  );
};

export default GradientButton;

// ─────────────────────────────────────────────────────────────────────────────
// Usage examples
// ─────────────────────────────────────────────────────────────────────────────
//
// <GradientButton variant="emerald" icon={<Plus size={13} />}>
//   Add Table
// </GradientButton>
//
// <GradientButton variant="gold" icon={<Download size={13} />}>
//   Export
// </GradientButton>
//
// <GradientButton variant="coral" loading={isDeleting}>
//   Delete
// </GradientButton>
//
// <GradientButton variant="ghost" size="sm">
//   Cancel
// </GradientButton>