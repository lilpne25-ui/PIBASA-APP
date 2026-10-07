import { VluxMark } from "@/components/vlux-mark";

/** Credito de autoria discreto: marca VLUX como luz (sin placa) + texto. */
export function VluxCredit() {
  return (
    <p className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.25em] text-steel-500/80">
      <VluxMark height={30} />
      <span>Desarrollado por VLUX</span>
    </p>
  );
}
