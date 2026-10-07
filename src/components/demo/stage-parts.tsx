import type { ReactNode } from "react";
import type { DemoData } from "@/application/demo/load-demo-data";

export type StageProps = { step: number; data: DemoData; onInteract: () => void };

/** Muestra su contenido cuando `on` es verdadero; el paso depende solo del avance de la escena. */
export function Reveal({ on, children, className = "" }: { on: boolean; children: ReactNode; className?: string }) {
  return (
    <div
      className={`transition-[opacity,transform] duration-700 ease-spring ${
        on ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
      } ${className}`}
      aria-hidden={!on}
    >
      {children}
    </div>
  );
}

export function SimBadge({ children = "Simulación" }: { children?: ReactNode }) {
  return <span className="chip chip-warn">{children}</span>;
}

export function RealBadge({ children = "Catálogo real" }: { children?: ReactNode }) {
  return <span className="chip chip-active">{children}</span>;
}

/** Marco tipo ventana para ubicar cada pantalla (ruta, y si es real o simulada). */
export function Frame({ path, badge, children }: { path: string; badge: ReactNode; children: ReactNode }) {
  return (
    <div className="panel overflow-hidden">
      <div className="flex items-center justify-between gap-4 border-b border-ink-600/70 bg-ink-950/50 px-5 py-2.5">
        <div className="flex items-center gap-3">
          <span className="flex gap-1.5" aria-hidden="true">
            <i className="h-2 w-2 rounded-full bg-ink-600" />
            <i className="h-2 w-2 rounded-full bg-ink-600" />
            <i className="h-2 w-2 rounded-full bg-ink-600" />
          </span>
          <span className="font-mono text-xs text-steel-500">{path}</span>
        </div>
        {badge}
      </div>
      <div className="p-4 md:p-5">{children}</div>
    </div>
  );
}
