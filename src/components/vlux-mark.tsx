import Image from "next/image";

/**
 * Marca VLUX integrada como LUZ, no como placa: PNG con transparencia (generado con
 * scripts/generar_logo_vlux.py a partir del JPG con fondo negro), opacidad reducida y un resplandor
 * difuso detras. Sin cuadro negro, sin bloque de color.
 */
export function VluxMark({
  height = 34,
  withWordmark = false,
  glow = true,
  className = ""
}: {
  height?: number;
  withWordmark?: boolean;
  glow?: boolean;
  className?: string;
}) {
  const src = withWordmark ? "/brand/vlux/vlux-mark.png" : "/brand/vlux/vlux-icon.png";
  const ratio = withWordmark ? 459 / 512 : 192 / 177;
  return (
    <span className={`relative inline-flex shrink-0 items-center justify-center ${className}`} style={{ height }}>
      {glow && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-signal/25 blur-xl"
          style={{ width: height * 1.5, height: height * 1.5 }}
        />
      )}
      <Image
        src={src}
        alt="VLUX"
        width={Math.round(height * ratio * 2)}
        height={height * 2}
        style={{ height, width: "auto" }}
        className="relative opacity-80 drop-shadow-[0_0_8px_rgba(111,183,201,0.45)]"
      />
    </span>
  );
}
