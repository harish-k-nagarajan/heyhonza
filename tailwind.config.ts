import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
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
        card: "var(--radius-card)",
      },
      fontFamily: {
        // Body + display are a design-selectable axis (Design Lab). Both resolve
        // to a `--f-*` face via `--font-body` / `--font-display`, set by the
        // pre-paint script and DesignRoot. Classic maps both to Share Tech Mono,
        // so `font-sans` stays byte-for-byte on the shipped app.
        sans: ["var(--font-body)"],
        display: ["var(--font-display)"],
      },
      animation: {
        honza: "honza 4s ease-in-out infinite",
        "honza-idle": "honza-idle 3s ease-in-out infinite",
        "honza-thinking": "honza-thinking 0.8s ease-in-out infinite",
        "honza-speak": "honza-speak 0.4s ease-out 1 forwards",
        "honza-oops": "honza-oops 3.5s ease-in-out infinite",
        "honza-excited": "honza-excited 2.6s ease-in-out infinite",
        blink: "blink 1.1s step-end infinite",
        "landing-fade-in": "landing-fade-in 280ms var(--ease-out) forwards",
        "message-in": "message-in var(--duration-bubble-in) var(--ease-out) forwards",
        "drawer-in": "drawer-in var(--duration-drawer-in) var(--ease-drawer) forwards",
        "drawer-backdrop": "drawer-backdrop var(--duration-bubble-in) var(--ease-out) forwards",
        "channel-pulse": "channel-pulse 0.45s var(--ease-out) 1",
        "honza-pop": "honza-pop var(--duration-orb-pop) var(--ease-out)",
        "typing-dot": "typing-dot 450ms var(--ease-in-out) infinite",
        "typing-bubble-in": "typing-bubble-in var(--duration-bubble-in) var(--ease-out) forwards",
        "orb-halo-idle": "orb-halo-idle 5s var(--ease-in-out) infinite",
        "orb-halo-thinking": "orb-halo-thinking 1.2s var(--ease-in-out) infinite",
        "orb-halo-speak": "orb-halo-speak 600ms var(--ease-in-out) 1 forwards",
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
        "landing-fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "message-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "drawer-in": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "drawer-backdrop": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "channel-pulse": {
          "0%": { filter: "brightness(1)" },
          "40%": { filter: "brightness(1.35)" },
          "100%": { filter: "brightness(1)" },
        },
        "honza-pop": {
          "0%": { transform: "scale(1)" },
          "35%": { transform: "scale(1.06)" },
          "100%": { transform: "scale(1)" },
        },
        "typing-dot": {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.7" },
        },
        "typing-bubble-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "orb-halo-idle": {
          "0%, 100%": { opacity: "0.07" },
          "50%": { opacity: "0.13" },
        },
        "orb-halo-thinking": {
          "0%, 100%": { opacity: "0.1", transform: "scale(1)" },
          "50%": { opacity: "0.35", transform: "scale(1.15)" },
        },
        "orb-halo-speak": {
          "0%": { opacity: "0.1", transform: "scale(1)" },
          "40%": { opacity: "0.38", transform: "scale(1.2)" },
          "100%": { opacity: "0.1", transform: "scale(1)" },
        },
      },
      maxWidth: {
        app: "430px",
        landing: "960px",
      },
    },
  },
  plugins: [],
};

export default config;
