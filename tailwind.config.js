/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#070C18",
          900: "#0B1120",
          800: "#111827",
          700: "#1E293B",
          600: "#243044",
          500: "#2E3F5C",
        },
        glass: {
          faint: "rgba(255,255,255,0.03)",
          DEFAULT: "rgba(255,255,255,0.055)",
          elevated: "rgba(255,255,255,0.09)",
          border: "rgba(255,255,255,0.08)",
          "border-hi": "rgba(255,255,255,0.14)",
        },
        accent: {
          emerald: "#10B981",
          "emerald-glow": "rgba(16,185,129,0.28)",
          gold: "#D4A84B",
          "gold-glow": "rgba(212,168,75,0.28)",
          cyan: "#06B6D4",
          "cyan-glow": "rgba(6,182,212,0.28)",
          coral: "#F43F5E",
          "coral-glow": "rgba(244,63,94,0.28)",
          violet: "#8B5CF6",
          "violet-glow": "rgba(139,92,246,0.28)",
          blue: "#3B82F6",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["'IBM Plex Mono'", "'Fira Code'", "monospace"],
      },
      fontSize: {
        "2xs": ["10px", { lineHeight: "14px" }],
        xs: ["11px", { lineHeight: "16px" }],
        sm: ["12px", { lineHeight: "18px" }],
        base: ["13px", { lineHeight: "20px" }],
        md: ["14px", { lineHeight: "22px" }],
        lg: ["16px", { lineHeight: "24px" }],
        xl: ["18px", { lineHeight: "28px" }],
        "2xl": ["20px", { lineHeight: "30px" }],
        "3xl": ["24px", { lineHeight: "32px" }],
        "4xl": ["30px", { lineHeight: "38px" }],
        "5xl": ["36px", { lineHeight: "44px" }],
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "20px",
        "4xl": "24px",
        "pill": "9999px",
      },
      boxShadow: {
        glass: "0 4px 24px rgba(0,0,0,0.28)",
        "glass-lg": "0 8px 40px rgba(0,0,0,0.36)",
        "glass-xl": "0 16px 56px rgba(0,0,0,0.44)",
        "glow-emerald": "0 0 24px rgba(16,185,129,0.35)",
        "glow-gold": "0 0 24px rgba(212,168,75,0.35)",
        "glow-cyan": "0 0 24px rgba(6,182,212,0.35)",
        "glow-coral": "0 0 24px rgba(244,63,94,0.35)",
        "glow-violet": "0 0 24px rgba(139,92,246,0.35)",
        "glow-blue": "0 0 24px rgba(59,130,246,0.35)",
      },
      backgroundImage: {
        "gradient-emerald-cyan": "linear-gradient(135deg, #10B981 0%, #06B6D4 100%)",
        "gradient-gold-amber": "linear-gradient(135deg, #D4A84B 0%, #F59E0B 100%)",
        "gradient-violet-blue": "linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)",
        "gradient-coral-rose": "linear-gradient(135deg, #F43F5E 0%, #FB7185 100%)",
        "gradient-cyan-blue": "linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)",
        "mesh-hero": `
          radial-gradient(ellipse at 20% 50%, rgba(16,185,129,0.08) 0%, transparent 60%),
          radial-gradient(ellipse at 80% 20%, rgba(139,92,246,0.08) 0%, transparent 55%),
          radial-gradient(ellipse at 60% 80%, rgba(6,182,212,0.06) 0%, transparent 50%)
        `,
        "mesh-auth": `
          radial-gradient(ellipse at 30% 40%, rgba(212,168,75,0.10) 0%, transparent 55%),
          radial-gradient(ellipse at 70% 60%, rgba(6,182,212,0.08) 0%, transparent 50%),
          radial-gradient(ellipse at 50% 90%, rgba(139,92,246,0.07) 0%, transparent 45%)
        `,
        "noise": "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E\")",
      },
      animation: {
        shimmer: "shimmer 2.4s linear infinite",
        "pulse-border": "pulse-border 3.5s ease-in-out infinite",
        float: "float 4s ease-in-out infinite",
        "count-up": "count-up 0.5s cubic-bezier(.22,1,.36,1) both",
        skeleton: "skeleton 1.8s ease-in-out infinite",
        "bar-grow": "bar-grow 0.9s cubic-bezier(.22,1,.36,1) both",
        "spin-slow": "spin-slow 12s linear infinite",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        "pulse-border": {
          "0%, 100%": { opacity: "0.3" },
          "50%": { opacity: "0.8" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "count-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        skeleton: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "bar-grow": {
          "0%": { transform: "scaleX(0)" },
          "100%": { transform: "scaleX(1)" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      backdropBlur: {
        xs: "4px",
        sm: "8px",
        md: "12px",
        lg: "18px",
        xl: "24px",
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.22, 1, 0.36, 1)",
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
        snappy: "cubic-bezier(0.6, 0, 0.4, 1)",
      },
    },
  },
  plugins: [],
}