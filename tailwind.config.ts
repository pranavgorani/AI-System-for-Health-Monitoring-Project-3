import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        aerospace: {
          950: "#06090e",
          900: "#0b0f19",
          850: "#0f1624",
          800: "#141c2e",
          750: "#1b253b",
          700: "#24314c",
          600: "#334155",
          500: "#64748b",
          400: "#94a3b8",
          300: "#cbd5e1",
          200: "#e2e8f0",
          100: "#f1f5f9",
          cyan: "#00f0ff",
          amber: "#f59e0b",
          emerald: "#10b981",
          rose: "#ef4444",
          blue: "#38bdf8",
        },
      },
      fontFamily: {
        mono: ["Consolas", "Courier New", "monospace"],
      },
    },
  },
  plugins: [],
} satisfies Config;
