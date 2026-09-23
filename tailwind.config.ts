import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#000000",
        surface: "#080808",
        "surface-card": "#0d0d0d",
        "surface-hover": "#141414",
        border: "#222222",
        "border-subtle": "#191919",
        "border-glow": "#333333",
        vercel: {
          blue: "#0070F3",
          cyan: "#50E3C2",
          purple: "#7928CA",
          magenta: "#FF0080",
          amber: "#F5A623",
          green: "#00E599",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["Geist Mono", "JetBrains Mono", "Fira Code", "monospace"],
      },
      boxShadow: {
        glow: "0 0 40px -10px rgba(255, 255, 255, 0.15)",
        "glow-cyan": "0 0 35px -5px rgba(80, 227, 194, 0.25)",
        "glow-purple": "0 0 35px -5px rgba(121, 40, 202, 0.25)",
        "glow-blue": "0 0 35px -5px rgba(0, 112, 243, 0.25)",
      },
      backgroundImage: {
        "grid-pattern": "linear-gradient(to right, #181818 1px, transparent 1px), linear-gradient(to bottom, #181818 1px, transparent 1px)",
        "spotlight": "radial-gradient(circle 600px at 50% -100px, rgba(120, 119, 198, 0.12), transparent 70%)",
        "spotlight-vercel": "radial-gradient(circle 500px at 50% 0%, rgba(255, 255, 255, 0.08), transparent 80%)",
      },
    },
  },
  plugins: [],
};
export default config;
