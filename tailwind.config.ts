import type { Config } from "tailwindcss";

// Paleta derivada de los logos VLUX (carpeta "LOGOS VLUX"):
//  - fondo (ink-950): #01040d medido en 1-logotipo-principal.jpg (fondo azul-negro).
//  - blanco gelido (steel-100): #e0f8f8 medido en el texto del logo horizontal.
//  - acento cian (signal): ~#5fd0e8 ESTIMADO a ojo del resplandor del logo (los JPG tienen antialias).
// Pibasa aun no entrega su logo: cuando llegue, su color de marca reemplaza a "signal" en la app.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: { 950: "#01040d", 900: "#060b17", 800: "#0b1322", 700: "#131c2e", 600: "#1f2b40" },
        steel: { 100: "#e0f8f8", 300: "#9fb3bd", 500: "#62747f" },
        signal: { DEFAULT: "#5fd0e8", dim: "#3a9db3" },
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
