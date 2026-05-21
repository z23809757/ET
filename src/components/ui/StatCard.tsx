/**
 * src/components/ui/StatCard.tsx
 *
 * Premium metric card for the dashboard. Composes GlassCard with:
 *  - AnimatedNumber counter on mount
 *  - Trend badge (up / down / neutral)
 *  - Optional sparkline slot
 *  - Optional sub-row with secondary metric
 */

import React from "react";
import { motion } from "framer-motion";
import GlassCard, { GlassCardVariant } from "./GlassCard";
import AnimatedNumber from "./AnimatedNumber";
import { COLORS, EASING } from "../../lib/theme";
import { cn } from "../../lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export type TrendDirection = "up" | "down" | "neutral";

export interface StatCardProps {
  label:        string;
  value:        number;
  /** Format function (e.g. formatUSD, formatINR, (n)=>`${n}%`) */
  format?:      (n: number) => string;
  trend?:       TrendDirection;
  trendLabel?:  string;          // e.g. "+8.4% this month"
  subLabel?:    string;          // secondary row label
  subValue?:    string;          // secondary row value
  subValueColor?:string;
  icon?:        React.ReactNode;
  accentColor?: string;
  variant?:     GlassCardVariant;
  /** Progress bar 0–100 */
  progress?:    number;
  progressMax?: number;
  sparkline?:   React.ReactNode;
  className?:   string;
  onClick?:     React.MouseEventHandler<HTMLDivElement>;
  /** Delay the count-up animation (seconds) */
  animDelay?:   number;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const TrendBadge: React.FC<{ direction: TrendDirection; label?: string; accent: string }> = ({
  direction, label, accent
}) => {
  const cfg = {
    up:      { symbol: "↑", color: COLORS.accent.emerald, bg: COLORS.accent.emeraldDim },
    down:    { symbol: "↓", color: COLORS.accent.coral,   bg: COLORS.accent.coralDim   },
    neutral: { symbol: "→", color: COLORS.text.secondary, bg: "rgba(255,255,255,0.06)"  },
  }[direction];

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{ color: cfg.color, background: cfg.bg }}
    >
      <span>{cfg.symbol}</span>
      {label && <span>{label}</span>}
    </span>
  );
};

const ProgressBar: React.FC<{ value: number; max?: number; color: string }> = ({
  value, max = 100, color
}) => {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="mt-2.5 h-1 w-full rounded-full bg-white/[0.07] overflow-hidden">
      <motion.div
        className="h-full rounded-full origin-left"
        style={{ background: color }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: pct / 100 }}
        transition={{ duration: 0.9, delay: 0.35, ease: EASING.spring }}
      />
    </div>
  );
};

// ─── StatCard ─────────────────────────────────────────────────────────────────

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  format       = (n) => String(n),
  trend,
  trendLabel,
  subLabel,
  subValue,
  subValueColor,
  icon,
  accentColor  = COLORS.accent.blue,
  variant      = "default",
  progress,
  progressMax,
  sparkline,
  className,
  onClick,
  animDelay    = 0,
}) => (
  <GlassCard
    variant={variant}
    accentColor={accentColor}
    onClick={onClick}
    className={className}
  >
    {/* Header row */}
    <div className="flex items-start justify-between gap-3 mb-3">
      {/* Label + chip */}
      <div className="flex items-center gap-2 min-w-0">
        {icon && (
          <div
            className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: `${accentColor}18`, border: `1px solid ${accentColor}28` }}
          >
            <span style={{ color: accentColor }}>{icon}</span>
          </div>
        )}
        <span
          className="chip text-2xs"
          style={{ color: COLORS.text.secondary }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ background: accentColor }}
          />
          {label}
        </span>
      </div>

      {/* Trend badge */}
      {trend && (
        <TrendBadge direction={trend} label={trendLabel} accent={accentColor} />
      )}
    </div>

    {/* Primary value */}
    <AnimatedNumber
      value={value}
      format={format}
      className={cn(
        "block font-bold tabular",
        "text-[28px] leading-tight tracking-tighter text-white/92",
      )}
      delay={animDelay}
    />

    {/* Progress bar */}
    {progress !== undefined && (
      <ProgressBar value={progress} max={progressMax} color={accentColor} />
    )}

    {/* Sparkline slot */}
    {sparkline && (
      <div className="mt-3">{sparkline}</div>
    )}

    {/* Sub row */}
    {(subLabel || subValue) && (
      <>
        <div className="glass-divider" />
        <div className="flex items-center justify-between">
          {subLabel && (
            <span className="text-xs" style={{ color: COLORS.text.tertiary }}>
              {subLabel}
            </span>
          )}
          {subValue && (
            <span
              className="text-xs font-medium"
              style={{ color: subValueColor ?? COLORS.text.secondary }}
            >
              {subValue}
            </span>
          )}
        </div>
      </>
    )}
  </GlassCard>
);

export default StatCard;