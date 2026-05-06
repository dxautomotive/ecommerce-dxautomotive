const path = require("path")

module.exports = {
  darkMode: "class",
  presets: [require("@medusajs/ui-preset")],
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/modules/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      transitionProperty: {
        width: "width margin",
        height: "height",
        bg: "background-color",
        display: "display opacity",
        visibility: "visibility",
        padding: "padding-top padding-right padding-bottom padding-left",
      },
      colors: {
        // ─── DX Automotive — Design System v3.0 (Light theme) ───
        // Migração v2.1 dark → v3.0 light. Fundos brancos, texto preto-azulado,
        // cores de marca (azul, cyan, pix, wpp, star) preservadas com ajustes
        // pontuais de contraste. Fonte: globals.css :root vars.
        brand: {
          // Fundos
          bg: "#FFFFFF",
          "bg-deep": "#F8FAFC",
          surface: "#FFFFFF",
          "surface-2": "#F4F6FA",
          "surface-3": "#E8ECF2",

          // Bordas
          border: "#E2E8F0",
          "border-2": "#CBD5E0",

          // Primária — escurecida 1 tom pra contraste em fundo branco
          primary: "#0066DD",
          "primary-h": "#0055CC",
          "primary-d": "#0044BB",
          "primary-hover": "#0055CC", // alias compat

          // Cyan — escurecida pra usar como eyebrow legível
          cyan: "#0099CC",

          // Silver / chrome — invertidos pra fundo claro
          silver: "#4A6880",
          "silver-dim": "#94A3B8",

          // Texto — invertido (preto-azulado preserva personalidade da marca)
          text: "#0A0F1A",
          "text-2": "#475569",
          "text-3": "#94A3B8",
          muted: "#475569", // alias compat (era cinza-azulado claro no dark)

          // Semânticas — escurecidas pra contraste em branco
          success: "#00A044",
          warning: "#E5560A",
          danger: "#D9302F",

          // BR — verdes escurecidos pra contraste em branco
          pix: "#2BA294",
          wpp: "#1FBD5A",
          "wpp-hover": "#16A04D",
          whatsapp: "#1FBD5A", // aliases compat
          "whatsapp-hover": "#16A04D",

          // Avaliações — amarelo um pouco mais saturado pra ler em branco
          star: "#F2A700",
        },
        grey: {
          0: "#FFFFFF",
          5: "#F9FAFB",
          10: "#F3F4F6",
          20: "#E5E7EB",
          30: "#D1D5DB",
          40: "#9CA3AF",
          50: "#6B7280",
          60: "#4B5563",
          70: "#374151",
          80: "#1F2937",
          90: "#111827",
        },
      },
      borderRadius: {
        none: "0px",
        soft: "2px",
        xs: "4px",
        sm: "6px",
        base: "4px",
        DEFAULT: "8px",
        md: "8px",
        rounded: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "20px",
        large: "16px",
        circle: "9999px",
      },
      maxWidth: {
        "8xl": "100rem",
      },
      screens: {
        "2xsmall": "320px",
        xsmall: "512px",
        small: "1024px",
        medium: "1280px",
        large: "1440px",
        xlarge: "1680px",
        "2xlarge": "1920px",
      },
      fontSize: {
        "3xl": "2rem",
      },
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Ubuntu",
          "sans-serif",
        ],
        display: [
          "var(--font-display)",
          "Barlow Condensed",
          "Inter",
          "sans-serif",
        ],
      },
      backgroundImage: {
        // Gradientes ajustados pra fundo claro: tons escurecidos preservam contraste do texto
        "grad-primary": "linear-gradient(135deg, #0099FF 0%, #0044BB 100%)",
        "grad-electric":
          "linear-gradient(90deg, #00B8E5 0%, #0077EE 50%, #0044BB 100%)",
        // Chrome agora vai escuro→escuro pra ficar legível em fundo branco (logo "AUTOMOTIVE")
        "grad-chrome":
          "linear-gradient(160deg, #94A3B8 0%, #475569 50%, #1E293B 100%)",
        // Hero gradient bem leve (off-white → cinza-claro)
        "grad-bg-deep": "linear-gradient(135deg, #FFFFFF 0%, #F4F6FA 100%)",
      },
      boxShadow: {
        // Shadows soft em vez de halos brilhantes — o fundo branco rejeita glows fortes
        "glow-primary":
          "0 4px 16px rgba(0, 102, 221, .18), 0 2px 6px rgba(0, 102, 221, .10)",
        "glow-cyan": "0 4px 16px rgba(0, 153, 204, .18)",
        "glow-sm": "0 2px 8px rgba(0, 102, 221, .20)",
      },
      keyframes: {
        ring: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "fade-in-right": {
          "0%": { opacity: "0", transform: "translateX(10px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "fade-in-top": {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "none" },
        },
        "fade-out-top": {
          "0%": { height: "100%" },
          "99%": { height: "0" },
          "100%": { visibility: "hidden" },
        },
        "accordion-slide-up": {
          "0%": {
            height: "var(--radix-accordion-content-height)",
            opacity: "1",
          },
          "100%": { height: "0", opacity: "0" },
        },
        "accordion-slide-down": {
          "0%": {
            "min-height": "0",
            "max-height": "0",
            opacity: "0",
          },
          "100%": {
            "min-height": "var(--radix-accordion-content-height)",
            "max-height": "none",
            opacity: "1",
          },
        },
        enter: {
          "0%": { transform: "scale(0.9)", opacity: 0 },
          "100%": { transform: "scale(1)", opacity: 1 },
        },
        leave: {
          "0%": { transform: "scale(1)", opacity: 1 },
          "100%": { transform: "scale(0.9)", opacity: 0 },
        },
        "slide-in": {
          "0%": { transform: "translateX(-12px)", opacity: "0" },
          "100%": { transform: "none", opacity: "1" },
        },
        shimmer: {
          "0%": { opacity: ".35" },
          "100%": { opacity: ".7" },
        },
      },
      animation: {
        ring: "ring 2.2s cubic-bezier(0.5, 0, 0.5, 1) infinite",
        "fade-in-right":
          "fade-in-right 0.3s cubic-bezier(0.5, 0, 0.5, 1) forwards",
        "fade-in-top":
          "fade-in-top 0.2s cubic-bezier(0.5, 0, 0.5, 1) forwards",
        "fade-in": "fade-in 0.4s ease both",
        "fade-out-top":
          "fade-out-top 0.2s cubic-bezier(0.5, 0, 0.5, 1) forwards",
        "accordion-open":
          "accordion-slide-down 300ms cubic-bezier(0.87, 0, 0.13, 1) forwards",
        "accordion-close":
          "accordion-slide-up 300ms cubic-bezier(0.87, 0, 0.13, 1) forwards",
        enter: "enter 200ms ease-out",
        "slide-in": "slide-in 0.3s ease both",
        leave: "leave 150ms ease-in forwards",
        shimmer: "shimmer 1.3s ease-in-out infinite alternate",
      },
    },
  },
  plugins: [require("tailwindcss-radix")()],
}
