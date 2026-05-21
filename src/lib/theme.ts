/**
 * src/lib/theme.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Single source of truth for all design tokens.
 * Use these in Tailwind arbitrary values, inline styles, or className helpers.
 */

// ─── Color palette ────────────────────────────────────────────────────────────

export const COLORS = {
  // Backgrounds
  bg: {
    base:    "#0B1120",   // deepest navy — body background
    surface: "#111827",   // cards / panels
    raised:  "#1E293B",   // inputs, table rows, secondary surfaces
    overlay: "#243044",   // tooltips, popovers
  },

  // Glass layers (rgba)
  glass: {
    faint:    "rgba(255,255,255,0.03)",
    default:  "rgba(255,255,255,0.055)",
    elevated: "rgba(255,255,255,0.09)",
    border:   "rgba(255,255,255,0.08)",
    borderHi: "rgba(255,255,255,0.14)",
  },

  // Accent palette — "Grand Line" inspired
  accent: {
    // Emerald (primary action / income)
    emerald:     "#10B981",
    emeraldGlow: "rgba(16,185,129,0.28)",
    emeraldDim:  "rgba(16,185,129,0.12)",

    // Gold (treasure / highlight)
    gold:     "#D4A84B",
    goldGlow: "rgba(212,168,75,0.28)",
    goldDim:  "rgba(212,168,75,0.12)",

    // Cyan (ocean / overview)
    cyan:     "#06B6D4",
    cyanGlow: "rgba(6,182,212,0.28)",
    cyanDim:  "rgba(6,182,212,0.12)",

    // Coral (expenses / danger)
    coral:     "#F43F5E",
    coralGlow: "rgba(244,63,94,0.28)",
    coralDim:  "rgba(244,63,94,0.12)",

    // Violet (investments / savings)
    violet:     "#8B5CF6",
    violetGlow: "rgba(139,92,246,0.28)",
    violetDim:  "rgba(139,92,246,0.12)",

    // Blue (info / neutral action)
    blue:     "#3B82F6",
    blueGlow: "rgba(59,130,246,0.28)",
    blueDim:  "rgba(59,130,246,0.12)",
  },

  // Text hierarchy
  text: {
    primary:   "rgba(255,255,255,0.92)",
    secondary: "rgba(255,255,255,0.55)",
    tertiary:  "rgba(255,255,255,0.32)",
    disabled:  "rgba(255,255,255,0.18)",
    inverse:   "#0B1120",
  },
} as const;

// ─── Gradients ────────────────────────────────────────────────────────────────

export const GRADIENTS = {
  emeraldCyan:   "linear-gradient(135deg, #10B981 0%, #06B6D4 100%)",
  goldAmber:     "linear-gradient(135deg, #D4A84B 0%, #F59E0B 100%)",
  violetBlue:    "linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)",
  coralRose:     "linear-gradient(135deg, #F43F5E 0%, #FB7185 100%)",
  cyanBlue:      "linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)",

  // Background mesh gradients
  heroMesh: `
    radial-gradient(ellipse at 20% 50%, rgba(16,185,129,0.08) 0%, transparent 60%),
    radial-gradient(ellipse at 80% 20%, rgba(139,92,246,0.08) 0%, transparent 55%),
    radial-gradient(ellipse at 60% 80%, rgba(6,182,212,0.06) 0%, transparent 50%)
  `,
  authMesh: `
    radial-gradient(ellipse at 30% 40%, rgba(212,168,75,0.10) 0%, transparent 55%),
    radial-gradient(ellipse at 70% 60%, rgba(6,182,212,0.08) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 90%, rgba(139,92,246,0.07) 0%, transparent 45%)
  `,
} as const;

// ─── Shadows ──────────────────────────────────────────────────────────────────

export const SHADOWS = {
  card:    "0 4px 24px rgba(0,0,0,0.28)",
  elevated:"0 8px 40px rgba(0,0,0,0.36)",
  glow: (color: string, spread = 20) =>
    `0 0 ${spread}px ${color}`,
  cardHover: (accentGlow: string) =>
    `0 16px 48px rgba(0,0,0,0.44), 0 0 0 1px ${accentGlow}`,
} as const;

// ─── Glassmorphism presets ────────────────────────────────────────────────────

export const GLASS = {
  default: {
    background:    COLORS.glass.default,
    backdropFilter:"blur(18px) saturate(155%)",
    WebkitBackdropFilter: "blur(18px) saturate(155%)",
    border:        `1px solid ${COLORS.glass.border}`,
    boxShadow:     SHADOWS.card,
  },
  elevated: {
    background:    COLORS.glass.elevated,
    backdropFilter:"blur(22px) saturate(165%)",
    WebkitBackdropFilter: "blur(22px) saturate(165%)",
    border:        `1px solid ${COLORS.glass.borderHi}`,
    boxShadow:     SHADOWS.elevated,
  },
  subtle: {
    background:    COLORS.glass.faint,
    backdropFilter:"blur(12px) saturate(140%)",
    WebkitBackdropFilter: "blur(12px) saturate(140%)",
    border:        `1px solid rgba(255,255,255,0.05)`,
    boxShadow:     "0 2px 12px rgba(0,0,0,0.18)",
  },
} as const;

// ─── Typography scale ─────────────────────────────────────────────────────────

export const TYPE = {
  size: {
    xs:  "10px",
    sm:  "11px",
    base:"13px",
    md:  "14px",
    lg:  "16px",
    xl:  "18px",
    "2xl":"20px",
    "3xl":"24px",
    "4xl":"30px",
    "5xl":"36px",
  },
  weight: { light: 300, regular: 400, medium: 500, semibold: 600, bold: 700 },
  family: {
    sans:  "'Inter', system-ui, sans-serif",
    mono:  "'IBM Plex Mono', 'Fira Code', monospace",
  },
  tracking: {
    tighter: "-0.03em",
    tight:   "-0.015em",
    normal:  "0em",
    wide:    "0.04em",
    wider:   "0.1em",
    widest:  "0.18em",
  },
} as const;

// ─── Spacing scale ────────────────────────────────────────────────────────────

export const SPACE = {
  1: "4px",  2: "8px",   3: "12px",  4: "16px",
  5: "20px", 6: "24px",  7: "28px",  8: "32px",
  10:"40px", 12:"48px",  16:"64px",
} as const;

// ─── Border radius ────────────────────────────────────────────────────────────

export const RADIUS = {
  sm:  "8px",
  md:  "12px",
  lg:  "16px",
  xl:  "20px",
  "2xl":"24px",
  pill:"999px",
} as const;

// ─── Animation easings (mirror in tailwind.config.js) ────────────────────────

export const EASING = {
  spring: [0.22, 1, 0.36, 1] as [number,number,number,number],
  smooth: [0.4, 0, 0.2, 1]  as [number,number,number,number],
  snappy: [0.6, 0, 0.4, 1]  as [number,number,number,number],
} as const;

export const DURATION = {
  fast:   0.15,
  base:   0.25,
  slow:   0.4,
  slower: 0.6,
} as const;

// ─── Framer Motion variant presets ───────────────────────────────────────────

export const MOTION = {
  fadeUp: {
    initial:   { opacity: 0, y: 14 },
    animate:   { opacity: 1, y: 0 },
    exit:      { opacity: 0, y: -8 },
    transition:{ duration: DURATION.slow, ease: EASING.spring },
  },
  fadeIn: {
    initial:   { opacity: 0 },
    animate:   { opacity: 1 },
    exit:      { opacity: 0 },
    transition:{ duration: DURATION.base },
  },
  scaleIn: {
    initial:   { opacity: 0, scale: 0.94 },
    animate:   { opacity: 1, scale: 1 },
    exit:      { opacity: 0, scale: 0.96 },
    transition:{ duration: DURATION.base, ease: EASING.spring },
  },
  slideInLeft: {
    initial:   { opacity: 0, x: -20 },
    animate:   { opacity: 1, x: 0 },
    exit:      { opacity: 0, x: -20 },
    transition:{ duration: DURATION.slow, ease: EASING.spring },
  },
  staggerContainer: {
    animate: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
  },
  staggerItem: {
    initial:   { opacity: 0, y: 12 },
    animate:   { opacity: 1, y: 0 },
    transition:{ duration: DURATION.slow, ease: EASING.spring },
  },
} as const;


// Add to src/lib/theme.ts

export const BACKGROUNDS = {
  // Default/Login/Signup - Going Merry / Sunny (ship deck)
  default: "url('https://images.unsplash.com/photo-1558449028-b53a89d7a9b2?q=80&w=2070&auto=format')",
  
  // Dashboard - Luffy (treasure/compass vibe)
  dashboard: "url('https://images.unsplash.com/photo-1508672019048-805c876b67e5?q=80&w=2073&auto=format')",
  
  // All Years - Nami (maps / navigation)
  allyears: "url('https://images.unsplash.com/photo-1524661135-423995f22d0f?q=80&w=2074&auto=format')",
  
  // Overall - Zoro (swords / strength)
  overall: "url('https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=2070&auto=format')",
  
  // Table View - Robin (ancient texts / knowledge)
  table: "url('https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=2073&auto=format')",
  
  // Global Reference - Franky (technology / engineering)
  global: "url('https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?q=80&w=2070&auto=format')",
};

// Overlay gradients to blend with the theme
export const OVERLAY_GRADIENTS = {
  default: 'linear-gradient(135deg, rgba(11,17,32,0.85) 0%, rgba(17,24,39,0.75) 100%)',
  dashboard: 'linear-gradient(135deg, rgba(11,17,32,0.8) 0%, rgba(212,168,75,0.15) 100%)',
  allyears: 'linear-gradient(135deg, rgba(11,17,32,0.8) 0%, rgba(6,182,212,0.15) 100%)',
  overall: 'linear-gradient(135deg, rgba(11,17,32,0.8) 0%, rgba(16,185,129,0.15) 100%)',
  table: 'linear-gradient(135deg, rgba(11,17,32,0.8) 0%, rgba(139,92,246,0.15) 100%)',
  global: 'linear-gradient(135deg, rgba(11,17,32,0.8) 0%, rgba(244,63,94,0.15) 100%)',
};

// ─── Table type colors (replaces old TYPE_C) ──────────────────────────────────

export const TABLE_TYPE_THEME: Record<string, { accent: string; glow: string; dim: string; label: string }> = {
  Income:     { accent: COLORS.accent.emerald, glow: COLORS.accent.emeraldGlow, dim: COLORS.accent.emeraldDim, label: "Income" },
  Expense:    { accent: COLORS.accent.coral,   glow: COLORS.accent.coralGlow,   dim: COLORS.accent.coralDim,   label: "Expense" },
  Investment: { accent: COLORS.accent.violet,  glow: COLORS.accent.violetGlow,  dim: COLORS.accent.violetDim,  label: "Investment" },
  Savings:    { accent: COLORS.accent.cyan,    glow: COLORS.accent.cyanGlow,    dim: COLORS.accent.cyanDim,    label: "Savings" },
  Asset:      { accent: COLORS.accent.gold,    glow: COLORS.accent.goldGlow,    dim: COLORS.accent.goldDim,    label: "Asset" },
  None:       { accent: COLORS.accent.blue,    glow: COLORS.accent.blueGlow,    dim: COLORS.accent.blueDim,    label: "General" },
};