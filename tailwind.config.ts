import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./types/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: "var(--pia-cream)",
          2: "var(--pia-cream-2)",
          3: "var(--pia-cream-3)"
        },
        ink: {
          DEFAULT: "var(--pia-ink)",
          soft: "var(--pia-ink-soft)"
        },
        muted: "var(--pia-muted)",
        green: {
          DEFAULT: "var(--pia-green)",
          soft: "var(--pia-green-soft)"
        },
        amber: {
          DEFAULT: "var(--pia-amber)",
          deep: "var(--pia-amber-deep)",
          soft: "var(--pia-amber-soft)"
        },
        red: {
          DEFAULT: "var(--pia-red)",
          soft: "var(--pia-red-soft)"
        },
        border: "var(--pia-border)"
      },
      fontFamily: {
        heading: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-outfit)", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      boxShadow: {
        soft: "0 20px 55px rgba(67, 54, 32, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
