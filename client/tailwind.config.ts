import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      /* ── Typography ──────────────────────────────────────── */
      fontFamily: {
        // Geist Sans — primary body & UI font (Vercel) with Inter & system fallbacks
        sans: [
          '"Geist"',
          '"Geist Sans"',
          '"Inter"',
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          "sans-serif",
        ],
        // Geist Mono — code, metrics & financial tables
        mono: [
          '"Geist Mono"',
          "ui-monospace",
          "SFMono-Regular",
          '"Roboto Mono"',
          "Menlo",
          "monospace",
        ],
      },

      /* ── Font sizes ──────────────────────────────────────── */
      fontSize: {
        // Captions, Badges & Footers
        xs: ["0.75rem", { lineHeight: "1rem" }],
        // Secondary UI & Metadata
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        // Standard Body Copy
        base: ["1rem", { lineHeight: "1.5rem" }],
        // Lead Paragraphs & Subheaders
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        // Cards & KPI Metrics
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        // Section & Page Titles
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
        // Hero — mobile
        "5xl": ["3rem", { lineHeight: "1.1" }],
        "6xl": ["3.75rem", { lineHeight: "1.1" }],
        // Hero — desktop
        "7xl": ["4.5rem", { lineHeight: "1.1" }],
        "8xl": ["6rem", { lineHeight: "1" }],
        "9xl": ["8rem", { lineHeight: "1" }],
      },

      /* ── Colors ──────────────────────────────────────────── */
      colors: {
        /* Shadcn / Radix semantic tokens (backed by CSS vars) */
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        /* ── Semantic functional ───────────────────────────── */
        success: {
          DEFAULT: "hsl(var(--success))",       // Herbal sage green
          foreground: "hsl(30, 25%, 97%)",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",        // Warm honey amber
          foreground: "hsl(25, 60%, 10%)",
        },

        /* ── Chocolate palette (direct use) ────────────────── */
        chocolate: {
          50:  "hsl(30, 25%, 97%)",   // Warm Cream
          100: "hsl(35, 40%, 95%)",   // Silk
          200: "hsl(30, 20%, 88%)",   // Warm Tan border
          300: "hsl(30, 25%, 75%)",
          400: "hsl(28, 35%, 60%)",
          500: "hsl(25, 45%, 40%)",
          600: "hsl(25, 45%, 25%)",   // Rich Chocolate (Primary)
          700: "hsl(25, 50%, 18%)",   // Dark Cocoa / Luxury sidebar
          800: "hsl(25, 55%, 14%)",
          900: "hsl(25, 60%, 10%)",   // Espresso
          950: "hsl(25, 50%, 8%)",    // Espresso-black (dark bg)
        },

        caramel: {
          300: "hsl(40, 90%, 70%)",
          400: "hsl(38, 85%, 62%)",
          500: "hsl(35, 80%, 55%)",   // Warm Amber / Caramel accent
          600: "hsl(40, 90%, 50%)",   // Honey amber / warning
          700: "hsl(35, 75%, 42%)",
        },

        /* ── Sidebar ───────────────────────────────────────── */
        sidebar: {
          DEFAULT: "hsl(25, 50%, 18%)",          // Luxury dark chocolate
          foreground: "hsl(30, 25%, 90%)",        // Soft warm text
          muted: "hsl(30, 20%, 60%)",
          border: "hsl(25, 45%, 22%)",
          accent: "hsl(35, 80%, 55%)",            // Caramel selection ring
          "accent-foreground": "hsl(25, 60%, 10%)",
        },
      },

      /* ── Border radius ───────────────────────────────────── */
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },

      /* ── Box shadows ─────────────────────────────────────── */
      boxShadow: {
        chocolate:
          "0 4px 6px -1px hsla(25, 45%, 25%, 0.25), 0 2px 4px -2px hsla(25, 45%, 25%, 0.15)",
        "chocolate-lg":
          "0 10px 15px -3px hsla(25, 45%, 25%, 0.25), 0 4px 6px -4px hsla(25, 45%, 25%, 0.15)",
        caramel:
          "0 4px 6px -1px hsla(35, 80%, 55%, 0.30), 0 2px 4px -2px hsla(35, 80%, 55%, 0.20)",
        "caramel-lg":
          "0 10px 15px -3px hsla(35, 80%, 55%, 0.30), 0 4px 6px -4px hsla(35, 80%, 55%, 0.20)",
      },

      /* ── Background gradients ────────────────────────────── */
      backgroundImage: {
        "gradient-chocolate":
          "linear-gradient(135deg, hsl(25, 60%, 10%) 0%, hsl(25, 45%, 25%) 100%)",
        "gradient-caramel":
          "linear-gradient(135deg, hsl(35, 80%, 55%) 0%, hsl(40, 90%, 50%) 100%)",
        "gradient-warm":
          "linear-gradient(135deg, hsl(30, 25%, 97%) 0%, hsl(35, 40%, 95%) 100%)",
        "gradient-espresso":
          "linear-gradient(180deg, hsl(25, 60%, 10%) 0%, hsl(25, 50%, 18%) 100%)",
      },

      /* ── Keyframes & animations ──────────────────────────── */
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
