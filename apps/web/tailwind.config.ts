import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f1f7ff",
          100: "#dcecff",
          200: "#bdd9ff",
          300: "#8cbcff",
          400: "#5895ff",
          500: "#3570ff",
          600: "#214eea",
          700: "#1d3ec9",
          800: "#22379f",
          900: "#233479",
        },
      },
      boxShadow: {
        panel: "0 20px 60px rgba(15, 23, 42, 0.35)",
      },
      fontFamily: {
        display: ["Poppins", "ui-sans-serif", "system-ui"],
        sans: ["Manrope", "ui-sans-serif", "system-ui"],
      },
      backgroundImage: {
        "hero-grid":
          "radial-gradient(circle at top, rgba(53,112,255,0.18), transparent 32%), linear-gradient(135deg, rgba(15,23,42,1) 0%, rgba(10,14,26,1) 45%, rgba(18,24,38,1) 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
