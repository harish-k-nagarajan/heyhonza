import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        muted: "var(--muted)",
        "muted-foreground": "var(--muted-foreground)",
        card: "var(--card)",
        "card-foreground": "var(--card-foreground)",
        border: "var(--border)",
        accent: "var(--accent)",
        "accent-foreground": "var(--accent-foreground)",
      },
      borderRadius: {
        card: "16px",
      },
      fontFamily: {
        sans: [
          "var(--font-share-tech-mono)",
          "ui-monospace",
          "monospace",
        ],
      },
      animation: {
        honza: "honza 4s ease-in-out infinite",
        "honza-idle": "honza-idle 3s ease-in-out infinite",
        "honza-thinking": "honza-thinking 0.8s ease-in-out infinite",
        "honza-speak": "honza-speak 0.4s ease-out 1 forwards",
        "honza-oops": "honza-oops 3.5s ease-in-out infinite",
        "honza-excited": "honza-excited 2.6s ease-in-out infinite",
        blink: "blink 1.1s step-end infinite",
      },
      keyframes: {
        honza: {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.04)", opacity: "0.9" },
        },
        "honza-idle": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.03)" },
        },
        "honza-thinking": {
          "0%, 100%": { opacity: "0.7" },
          "50%": { opacity: "1" },
        },
        "honza-speak": {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.06)" },
          "100%": { transform: "scale(1)" },
        },
        "honza-oops": {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.012)", opacity: "0.96" },
        },
        "honza-excited": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.04)" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
      },
      maxWidth: {
        app: "430px",
      },
    },
  },
  plugins: [],
};

export default config;
