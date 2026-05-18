/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Brand-core
        navy: {
          DEFAULT: "#002259",
          300: "#777F8B",
          400: "#8F9FB8",
        },
        // Blue palette (interactive + brand)
        blue: {
          100: "#E9F3FF",
          150: "#D7E7FE",
          200: "#D3E8FF",
          300: "#BDD7FF",
          500: "#79ADF8",
          600: "#155DFC",
          700: "#2670DC",
          900: "#0042AB",
        },
        // Nautral (blue-tinted neutrals)
        neutral: {
          50: "#F7F7F9",
          100: "#FFFFFF",
          200: "#F4F9FF",
          300: "#E0E8F2",
          400: "#D1D9E6",
          500: "#8F9FB8",
          550: "#798AA6",
          600: "#777F8B",
          700: "#5F6B7C",
          800: "#3F4A61",
          900: "#002259",
        },
        // Semantic
        success: "#0DDE53",
        skeleton: {
          DEFAULT: "#EFF4F9",
          dark: "#E5ECF3",
        },
        toolbar: "#CBE2FC",
      },
      fontFamily: {
        sans: ['"Instrument Sans Variable"', '"Instrument Sans"', "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ['"Instrument Serif"', "ui-serif", "Georgia", "serif"],
        mono: ['"Space Mono"', "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      letterSpacing: {
        // -0.5px refined tracking used almost everywhere
        refined: "-0.5px",
      },
      borderRadius: {
        xs: "2px",
        sm: "4px",
        md: "6px",
        lg: "8px",
        xl: "12px",
        "2xl": "16px",
        "3xl": "24px",
        organic: "32px",
      },
      backgroundImage: {
        sky: "linear-gradient(#BDD7FF 0%, #FFFFFF 39.45%)",
        cta: "linear-gradient(#0044B9 5.5%, #0074EC 35%, #4EB1FF 65%, #ADD9FF 95%)",
        orb: "radial-gradient(circle, rgba(121,173,248,0.22) 0%, rgba(189,215,255,0.14) 50%, rgba(255,255,255,0) 80%)",
      },
      boxShadow: {
        // Neumorphic inset glows — the only "elevation" in this system
        neumo: "rgba(255,255,255,0.75) -4px -4px 6px 0 inset, rgba(255,255,255,0.75) 4px 4px 6px 0 inset",
        "neumo-soft": "rgba(235,243,255,0.75) -2px -2px 4px 0 inset, rgba(235,243,255,0.75) 2px 2px 4px 0 inset",
        "cta-glow": "0 8px 24px -8px rgba(38,112,220,0.4)",
      },
      transitionTimingFunction: {
        vault: "cubic-bezier(0.4, 0, 0.2, 1)",
        "vault-out": "cubic-bezier(0, 0, 0.2, 1)",
      },
      maxWidth: {
        canvas: "1223px",
      },
    },
  },
  plugins: [],
};
