import type { Config } from "tailwindcss";

// Tokens PROVISIONALES. La paleta final sale de los logos VLUX (Drive, carpeta "LOGOS VLUX")
// y del logo de Pibasa, que aun no tenemos. Cambiar aqui, no en los componentes.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: { 950: "#08090b", 900: "#0e1014", 800: "#151821", 700: "#1e222d", 600: "#2b3040" },
        steel: { 100: "#e8ebf0", 300: "#aab1bf", 500: "#6f7889" },
        signal: { DEFAULT: "#c6ff3d", dim: "#8fb82a" },
        danger: "#ff5c5c"
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"]
      },
      transitionTimingFunction: { spring: "cubic-bezier(0.22, 1, 0.36, 1)" }
    }
  },
  plugins: []
};
export default config;
