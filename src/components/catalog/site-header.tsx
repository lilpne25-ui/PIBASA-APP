import Link from "next/link";

/** Marca provisional en texto: Pibasa aun no entrega su logo. */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-ink-600/60 bg-ink-950/75 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/catalogo" className="group flex items-baseline gap-3" aria-label="Pibasa, catalogo tecnico">
          <span className="text-2xl font-semibold tracking-[0.18em] text-steel-100">PIBASA</span>
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.28em] text-steel-500 transition-colors group-hover:text-steel-300 sm:inline">
            Aceros y Servicios
          </span>
        </Link>
        <nav className="flex items-center gap-6 text-sm text-steel-300">
          <Link href="/catalogo" className="transition-colors hover:text-steel-100">
            Catalogo
          </Link>
          <Link href="/login" className="transition-colors hover:text-steel-100">
            Acceso interno
          </Link>
        </nav>
      </div>
    </header>
  );
}
