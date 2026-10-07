import type { Config } from "tailwindcss";

// Paleta derivada de los logos VLUX (carpeta "LOGOS VLUX"), usada con moderacion:
//  - fondo (ink-950): #01040d medido en 1-logotipo-principal.jpg (fondo azul-negro).
//  - blanco gelido (steel-100): #e0f8f8 medido en el texto del logo horizontal.
//  - cian (signal): derivado del resplandor del logo, DESATURADO a proposito (#6fb7c9). Se usa como reflejo
//    (bordes, glows, estados), nunca como relleno plano: la marca principal es Pibasa, no VLUX.
//  - amber: advertencias ("datos de ejemplo"). Evoca metal caliente; contrasta con el cian frio.
// Pibasa aun no entrega su logo: cuando llegue, su color de marca se integra aqui.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: { 950: "#01040d", 900: "#060b17", 800: "#0b1322", 700: "#131c2e", 600: "#1f2b40" },
        steel: { 100: "#e0f8f8", 300: "#9fb3bd", 500: "#62747f" },
        signal: { DEFAULT: "#6fb7c9", dim: "#4a8797" },
        amber: "#d9a441",
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
