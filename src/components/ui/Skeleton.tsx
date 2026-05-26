/**
 * src/components/ui/Skeleton.tsx
 *
 * Composable shimmer-effect skeleton system.
 *
 * Exports:
 *  - <Skeleton>         base block skeleton
 *  - <SkeletonText>     paragraph-style text lines
 *  - <SkeletonCard>     full StatCard placeholder
 *  - <SkeletonTable>    table rows placeholder
 */

import React from "react";
import { cn } from "../../lib/utils";

// ─── Base skeleton ────────────────────────────────────────────────────────────

export interface SkeletonProps {
  width?:     string | number;
  height?:    string | number;
  rounded?:   "sm" | "md" | "lg" | "full";
  className?: string;
  style?:     React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height  = 16,
  rounded = "md",
  className,
  style,
}) => {
  const roundedCls = {
    sm:   "rounded",
    md:   "rounded-lg",
    lg:   "rounded-xl",
    full: "rounded-full",
  }[rounded];

  return (
    <div
      aria-hidden
      className={cn("skeleton", roundedCls, className)}
      style={{ width, height, ...style }}
    />
  );
};

// ─── Text skeleton ────────────────────────────────────────────────────────────

export interface SkeletonTextProps {
  lines?:     number;
  /** Widths per line, e.g. ["80%","60%","40%"]. Cycles if fewer than lines. */
  widths?:    (string | number)[];
  gap?:       number;
  className?: string;
}

export const SkeletonText: React.FC<SkeletonTextProps> = ({
  lines   = 3,
  widths  = ["90%", "70%", "50%"],
  gap     = 8,
  className,
}) => (
  <div
    className={cn("flex flex-col", className)}
    style={{ gap }}
    aria-hidden
  >
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        width={widths[i % widths.length]}
        height={12}
      />
    ))}
  </div>
);

// ─── Card skeleton ────────────────────────────────────────────────────────────

export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
  <div
    aria-hidden
    className={cn(
      "relative isolate overflow-hidden rounded-2xl border",
      "border-white/[0.07] bg-white/[0.04] p-5",
      "backdrop-blur-sm",
      className,
    )}
  >
    {/* Label row */}
    <div className="flex items-center gap-2 mb-3">
      <Skeleton width={18} height={18} rounded="sm" />
      <Skeleton width={80} height={11} />
    </div>
    {/* Value */}
    <Skeleton width="55%" height={28} rounded="lg" className="mb-2" />
    {/* Sub label */}
    <Skeleton width="40%" height={10} className="mb-4" />
    {/* Divider */}
    <div className="h-px bg-white/[0.06] mb-3" />
    {/* Sub row */}
    <div className="flex items-center justify-between">
      <Skeleton width={60} height={10} />
      <Skeleton width={50} height={10} />
    </div>
  </div>
);

// ─── Table skeleton ───────────────────────────────────────────────────────────

export interface SkeletonTableProps {
  rows?:    number;
  cols?:    number;
  className?:string;
}

export const SkeletonTable: React.FC<SkeletonTableProps> = ({
  rows = 6,
  cols = 5,
  className,
}) => (
  <div
    aria-hidden
    className={cn(
      "relative isolate overflow-hidden rounded-2xl border",
      "border-white/[0.07] bg-white/[0.03]",
      className,
    )}
  >
    {/* Header row */}
    <div
      className="flex items-center gap-4 px-5 py-3 border-b border-white/[0.06]"
    >
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton
          key={i}
          width={i === 0 ? "20%" : `${Math.floor(80 / (cols - 1))}%`}
          height={10}
        />
      ))}
    </div>

    {/* Body rows */}
    {Array.from({ length: rows }).map((_, r) => (
      <div
        key={r}
        className="flex items-center gap-4 px-5 py-3 border-b border-white/[0.04] last:border-0"
      >
        {Array.from({ length: cols }).map((_, c) => (
          <Skeleton
            key={c}
            width={c === 0 ? "22%" : `${Math.floor(78 / (cols - 1)) - 2}%`}
            height={11}
            // Vary widths slightly for realism
            style={{ opacity: 1 - r * 0.08 } as React.CSSProperties}
          />
        ))}
      </div>
    ))}
  </div>
);

export default Skeleton;