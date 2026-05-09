import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Space Grotesk", "Inter", "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        banana: {
          50: "#FFFDE7",
          100: "#FFF9C4",
          200: "#FFF59D",
          300: "#FFF176",
          400: "#FFEE58",
          500: "#F5C518",
          600: "#F0B429",
          700: "#E6A817",
          800: "#CC8A00",
          900: "#A66E00",
        },
        neon: {
          purple: "#8B5CF6",
          cyan: "#06B6D4",
          pink: "#EC4899",
          green: "#10B981",
        },
        glass: {
          white: "rgba(255,255,255,0.06)",
          border: "rgba(255,255,255,0.12)",
          hover: "rgba(255,255,255,0.09)",
        },
        surface: {
          DEFAULT: "#0A0A0F",
          1: "#0F0F1A",
          2: "#141420",
          3: "#1A1A2E",
          4: "#1E1E35",
          5: "#252540",
        },
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
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      backgroundImage: {
        "banana-gradient": "linear-gradient(135deg, #F5C518 0%, #F0B429 50%, #E6A817 100%)",
        "neon-gradient": "linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%)",
        "studio-gradient": "linear-gradient(135deg, #0A0A0F 0%, #0F0F1A 40%, #1A1A2E 100%)",
        "hero-gradient": "linear-gradient(135deg, #0A0A0F 0%, #1A0A2E 40%, #0A1A2E 100%)",
        "card-gradient": "linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
        "banana-glow": "radial-gradient(circle at center, rgba(245,197,24,0.15) 0%, transparent 70%)",
        "purple-glow": "radial-gradient(circle at center, rgba(139,92,246,0.15) 0%, transparent 70%)",
        "cyan-glow": "radial-gradient(circle at center, rgba(6,182,212,0.10) 0%, transparent 70%)",
      },
      boxShadow: {
        glass: "0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)",
        "banana-glow": "0 0 20px rgba(245,197,24,0.3), 0 0 60px rgba(245,197,24,0.1)",
        "neon-glow": "0 0 20px rgba(139,92,246,0.4), 0 0 60px rgba(139,92,246,0.15)",
        "cyan-glow": "0 0 20px rgba(6,182,212,0.3)",
        "card-hover": "0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1)",
        "slide-shadow": "0 20px 60px rgba(0,0,0,0.6)",
      },
      borderRadius: {
        glass: "16px",
        xl: "12px",
        "2xl": "16px",
        "3xl": "24px",
      },
      backdropBlur: {
        glass: "20px",
        heavy: "40px",
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "glow-pulse": "glowPulse 3s ease-in-out infinite",
        "slide-in-up": "slideInUp 0.5s ease-out forwards",
        "fade-in": "fadeIn 0.4s ease-out forwards",
        shimmer: "shimmer 2s linear infinite",
        "spin-slow": "spin 8s linear infinite",
        "bounce-slow": "bounce 3s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        glowPulse: {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
        slideInUp: {
          from: { transform: "translateY(20px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
