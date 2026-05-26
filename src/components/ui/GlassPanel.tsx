import React from "react";
import { motion } from "framer-motion";
import { MOTION, COLORS } from "../../lib/theme";
import { cn } from "../../lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export type GlassPanelDepth = "default" | "elevated" | "subtle";

export interface GlassPanelProps {
  children:       React.ReactNode;
  /** Slot rendered above the content with a divider */
  header?:        React.ReactNode;
  /** Slot rendered below the content with a divider */
  footer?:        React.ReactNode;
  depth?:         GlassPanelDepth;
  /** @deprecated Alias for `depth`, kept for backward compatibility. */
  variant?:       GlassPanelDepth;
  /** Disable entry animation */
  static?:        boolean;
  /** Override border-radius (default: rounded-2xl) */
  radius?:        "md" | "lg" | "xl" | "2xl" | "3xl";
  /** Remove internal padding */
  flush?:         boolean;
  className?:     string;
  headerClassName?:string;
  bodyClassName?: string;
  footerClassName?:string;
}

// ─── Depth → class map ────────────────────────────────────────────────────────

const DEPTH_CLS: Record<GlassPanelDepth, string> = {
  default:  "glass",
  elevated: "glass-elevated",
  subtle:   "glass-subtle",
};

const RADIUS_CLS = {
  md:  "rounded-xl",
  lg:  "rounded-2xl",
  xl:  "rounded-3xl",
  "2xl":"rounded-[20px]",
  "3xl":"rounded-[24px]",
};

// ─── Component ────────────────────────────────────────────────────────────────

export const GlassPanel: React.FC<GlassPanelProps> = ({
  children,
  header,
  footer,
  depth,
  variant,
  static:       isStatic = false,
  radius        = "2xl",
  flush         = false,
  className,
  headerClassName,
  bodyClassName,
  footerClassName,
}) => {
  const resolvedDepth: GlassPanelDepth = depth ?? variant ?? "default";
  const Wrapper = isStatic ? "div" : motion.div;
  const motionProps = isStatic
    ? {}
    : { ...MOTION.fadeUp, layout: true };

  return (
    <Wrapper
      {...(motionProps as any)}
      className={cn(
        "relative isolate overflow-hidden",
        DEPTH_CLS[resolvedDepth],
        RADIUS_CLS[radius],
        className,
      )}
    >
      {/* Noise grain */}
      <div aria-hidden className="noise-overlay z-0" />

      {/* Top-edge shimmer */}
      <div aria-hidden className="top-shimmer z-10" />

      {/* Header */}
      {header && (
        <>
          <div
            className={cn(
              "relative z-20 flex items-center justify-between gap-3",
              flush ? "px-5 py-3.5" : "px-5 py-3.5",
              headerClassName,
            )}
          >
            {header}
          </div>
          <div className="glass-divider mx-5 my-0" />
        </>
      )}

      {/* Body */}
      <div
        className={cn(
          "relative z-20",
          flush ? "" : "p-5",
          bodyClassName,
        )}
      >
        {children}
      </div>

      {/* Footer */}
      {footer && (
        <>
          <div className="glass-divider mx-5 my-0" />
          <div
            className={cn(
              "relative z-20 flex items-center justify-end gap-2",
              flush ? "px-5 py-3.5" : "px-5 py-3.5",
              footerClassName,
            )}
          >
            {footer}
          </div>
        </>
      )}
    </Wrapper>
  );
};

export default GlassPanel;