/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{ts,tsx}",
    "../../src/components/**/*.{ts,tsx}",
    "../../src/lib/**/*.{ts,tsx}",
    "../../src/hooks/**/*.{ts,tsx}",
    "../../src/stores/**/*.{ts,tsx}",
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
        sans: ["var(--font-body)"],
        display: ["var(--font-display)"],
      },
      maxWidth: {
        app: "430px",
        landing: "960px",
      },
    },
  },
  plugins: [],
};
