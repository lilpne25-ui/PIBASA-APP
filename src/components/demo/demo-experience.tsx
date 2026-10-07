"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { DemoData } from "@/application/demo/load-demo-data";
import { VluxCredit } from "@/components/vlux-credit";
import { scenes } from "@/demo/scenes";
import { DemoPlayer } from "./demo-player";
import { PibasaWordmark } from "./pibasa-wordmark";

const real = ["Catálogo técnico público", "Fichas por grado: propiedades, equivalencias, aplicaciones", "Medidas con peso teórico por metro"];
const simulated = ["Cotizador con peso y precio estimado", "Folio y mensaje a WhatsApp", "Panel de seguimiento y consulta por folio", "Vista del dueño y reportes"];

export function DemoExperience({ data }: { data: DemoData }) {
  const [open, setOpen] = useState(false);
  const openerRef = useRef<HTMLButtonElement>(null);

  const close = () => {
    setOpen(false);
    // El foco vuelve al boton que abrio la demo una vez que el overlay desaparece.
    requestAnimationFrame(() => openerRef.current?.focus());
  };

  return (
    <>
      <div inert={open} className="relative min-h-dvh overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-[-120px] h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-signal/[0.07] blur-3xl"
        />
        <header className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <PibasaWordmark size="sm" />
          <Link href="/catalogo" className="text-sm text-steel-300 transition-colors hover:text-steel-100">
            Catálogo real
          </Link>
        </header>

        <main className="relative mx-auto max-w-6xl px-6 pb-16 pt-12 md:pt-20">
          <section className="rise-in max-w-3xl">
            <p className="eyebrow">Demostración · primera reunión</p>
            <h1 className="mt-5 text-4xl font-semibold leading-[1.04] tracking-tight md:text-7xl">
              Cotizar acero a medida,
              <span className="block text-steel-500">en minutos.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-steel-300">
              Un recorrido de unos {Math.round(scenes.length * 0.4)} minutos por el catálogo que ya existe y por lo que construiríamos
              después, con un caso concreto: un taller de matricería en León pide solera de D2 cortada a medida.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <button ref={openerRef} type="button" onClick={() => setOpen(true)} className="btn btn-primary !px-8 !py-4 text-base">
                Demostrar demo
              </button>
              <Link href="/catalogo" className="btn btn-ghost !py-4">
                Explorar el catálogo real
              </Link>
            </div>
            <p className="mt-4 text-xs text-steel-500">
              Con narración en voz y subtítulos. Puedes pausar, saltar de escena o salir en cualquier momento.
            </p>
          </section>

          <section className="rise-in rise-in-2 mt-16 grid gap-5 md:grid-cols-2" aria-label="Qué es real y qué es simulación">
            <div className="panel p-6">
              <span className="chip chip-active">Real hoy</span>
              <ul className="mt-5 space-y-2.5 text-sm text-steel-300">
                {real.map((r) => (
                  <li key={r} className="flex gap-3">
                    <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-signal" />
                    {r}
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-xs text-steel-500">
                {data.source === "catalog"
                  ? `${data.totalGrades} grados cargados desde la base de datos. Valores de ejemplo, pendientes de validar por Pibasa.`
                  : "El catálogo no respondió: la demo usa una muestra local mínima (solo D2)."}
              </p>
            </div>
            <div className="panel p-6">
              <span className="chip chip-warn">Simulación en esta demo</span>
              <ul className="mt-5 space-y-2.5 text-sm text-steel-300">
                {simulated.map((r) => (
                  <li key={r} className="flex gap-3">
                    <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-amber" />
                    {r}
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-xs text-steel-500">Datos, precios y cifras de ejemplo. No se envía ni se cobra nada.</p>
            </div>
          </section>
        </main>

        <footer className="relative mx-auto flex max-w-6xl items-center justify-between gap-6 border-t border-ink-600/70 px-6 py-10">
          <VluxCredit />
        </footer>
      </div>

      {open && <DemoPlayer data={data} onClose={close} />}
    </>
  );
}
