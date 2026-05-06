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
        // ─── DX Automotive — Design System v2.1 (KaBuM-inspired) ───
        // Fonte da verdade: DX_Automotive_Implementation_Guide.md
        brand: {
          // Fundos
          bg: "#050810",
          "bg-deep": "#030610",
          surface: "#0D1528",
          "surface-2": "#111E34",
          "surface-3": "#162540",

          // Bordas
          border: "#1A2540",
          "border-2": "#243050",

          // Primária (azul elétrico do feixe)
          primary: "#0088FF",
          "primary-h": "#0066DD",
          "primary-d": "#0044CC",
          // Alias temporário pra compatibilidade com código pré-v2.1
          "primary-hover": "#0066DD",

          // Cyan (núcleo brilhante)
          cyan: "#00CCFF",

          // Silver (cor "AUTO" no logo)
          silver: "#8AADCC",
          "silver-dim": "#4A6880",

          // Texto
          text: "#E8F0F8",
          "text-2": "#8AADCC",
          "text-3": "#4A6880",
          // Alias temporário (era brand-muted)
          muted: "#8AADCC",

          // Semânticas
          success: "#00C851",
          warning: "#FF6B00",
          danger: "#FF3D3D",

          // BR
          pix: "#32BCAD",
          wpp: "#25D366",
          "wpp-hover": "#1DA851",
          // Aliases temporários (era brand-whatsapp / brand-whatsapp-hover)
          whatsapp: "#25D366",
          "whatsapp-hover": "#1DA851",

          // Avaliações
          star: "#FFB800",
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
        "grad-primary": "linear-gradient(135deg, #0099FF 0%, #0055DD 100%)",
        "grad-electric":
          "linear-gradient(90deg, #00CCFF 0%, #0088FF 50%, #0044CC 100%)",
        "grad-chrome":
          "linear-gradient(160deg, #F0F2F5 0%, #C4C8D0 30%, #8090A0 60%, #3A4050 100%)",
        "grad-bg-deep":
          "linear-gradient(135deg, #0D1528 0%, #050810 100%)",
      },
      boxShadow: {
        "glow-primary":
          "0 0 20px rgba(0,136,255,.25), 0 0 40px rgba(0,100,220,.12)",
        "glow-cyan":
          "0 0 16px rgba(0,204,255,.30), 0 0 32px rgba(0,136,255,.15)",
        "glow-sm": "0 2px 12px rgba(0,120,255,.30)",
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
