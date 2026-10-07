/** Wordmark tipografico provisional de Pibasa (no hay logo del cliente). */
export function PibasaWordmark({ size = "md" }: { size?: "sm" | "md" | "xl" }) {
  const main = size === "xl" ? "text-6xl md:text-7xl" : size === "md" ? "text-3xl" : "text-xl";
  const sub = size === "xl" ? "text-xs md:text-sm" : "text-[10px]";
  return (
    <span className="inline-flex flex-col items-center leading-none">
      <span className={`${main} font-semibold tracking-[0.2em] text-steel-100 [text-shadow:0_0_40px_rgba(111,183,201,0.25)]`}>PIBASA</span>
      <span className={`${sub} mt-3 font-mono uppercase tracking-[0.4em] text-steel-500`}>Aceros y Servicios</span>
    </span>
  );
}
