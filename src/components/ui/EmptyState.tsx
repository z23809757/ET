/**
 * src/components/ui/EmptyState.tsx
 *
 * Replaces the plain text empty state with a polished glass panel version.
 * Accepts an icon (Lucide node), heading, sub-copy, and action buttons.
 *
 * Three size variants for different contexts:
 *   "page"    — fills a whole view (table with no rows, empty year)
 *   "section" — fills a card / panel section
 *   "inline"  — compact row-level empty
 */

import React from "react";
import { motion } from "framer-motion";
import { COLORS, EASING } from "../../lib/theme";
import { cn } from "../../lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export type EmptyStateSize = "page" | "section" | "inline";

export interface EmptyStateProps {
  icon?:      React.ReactNode;
  heading:    string;
  sub?:       string;
  actions?:   React.ReactNode;
  size?:      EmptyStateSize;
  className?: string;
  accentColor?: string;
}

// ─── Decorative ring animation ────────────────────────────────────────────────

const DecorativeRings: React.FC<{ color: string }> = ({ color }) => (
  <div className="relative flex items-center justify-center" aria-hidden>
    {/* Outer ring */}
    <motion.div
      className="absolute rounded-full border opacity-20"
      style={{ width: 120, height: 120, borderColor: color }}
      animate={{ scale: [1, 1.06, 1], opacity: [0.15, 0.25, 0.15] }}
      transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
    />
    {/* Middle ring */}
    <motion.div
      className="absolute rounded-full border opacity-25"
      style={{ width: 80, height: 80, borderColor: color }}
      animate={{ scale: [1, 1.04, 1], opacity: [0.2, 0.35, 0.2] }}
      transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
    />
    {/* Inner icon container */}
    <div
      className="relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center text-[22px]"
      style={{
        background: `${color}14`,
        border: `1px solid ${color}30`,
        boxShadow: `0 0 24px ${color}18`,
      }}
    />
  </div>
);

// ─── Component ────────────────────────────────────────────────────────────────

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  heading,
  sub,
  actions,
  size        = "page",
  className,
  accentColor = COLORS.accent.cyan,
}) => {
  const isPage    = size === "page";
  const isInline  = size === "inline";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASING.spring }}
      className={cn(
        "flex flex-col items-center justify-center text-center",
        isPage   && "min-h-[50vh] py-16 px-6",
        !isPage && !isInline && "py-12 px-6",
        isInline && "py-5 px-4",
        className,
      )}
    >
      {/* Icon with decorative rings */}
      {icon && !isInline && (
        <div className="relative mb-7">
          <DecorativeRings color={accentColor} />
          {/* Icon overlaid on the inner ring */}
          <div
            className="absolute inset-0 flex items-center justify-center text-[22px] pointer-events-none"
            style={{ color: accentColor }}
          >
            {icon}
          </div>
        </div>
      )}

      {isInline && icon && (
        <div className="mb-2 text-xl" style={{ color: accentColor }}>
          {icon}
        </div>
      )}

      {/* Heading */}
      <h3
        className={cn(
          "font-semibold",
          isPage    && "text-xl   text-white/80 mb-2",
          !isPage && !isInline && "text-lg text-white/75 mb-1.5",
          isInline  && "text-sm text-white/60 mb-1",
        )}
      >
        {heading}
      </h3>

      {/* Sub copy */}
      {sub && (
        <p
          className={cn(
            "max-w-xs leading-relaxed",
            isPage   && "text-sm  text-white/35 mb-8",
            !isPage && !isInline && "text-xs text-white/30 mb-6",
            isInline  && "text-xs text-white/28 mb-3",
          )}
        >
          {sub}
        </p>
      )}

      {/* Actions */}
      {actions && (
        <div className="flex items-center gap-2 flex-wrap justify-center">
          {actions}
        </div>
      )}
    </motion.div>
  );
};

export default EmptyState;