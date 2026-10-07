import { Suspense } from "react";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="mx-auto grid min-h-dvh max-w-5xl items-center gap-12 px-6 py-16 md:grid-cols-[1.1fr_0.9fr]">
      <section className="rise-in">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-signal">Pibasa / acceso interno</p>
        <h1 className="mt-6 text-5xl font-semibold leading-[1.02] tracking-tight md:text-7xl">
          Acero a medida,
          <br />
          <span className="text-steel-500">cotizado al momento.</span>
        </h1>
        <p className="mt-6 max-w-md text-steel-300">
          Panel interno para catalogo tecnico, cotizaciones y seguimiento. Acceso solo para el equipo de
          Aceros y Servicios Pibasa.
        </p>
      </section>

      <section className="rise-in rise-in-2 rounded-2xl border border-ink-600 bg-ink-900/80 p-8 backdrop-blur">
        <h2 className="text-lg font-medium">Iniciar sesion</h2>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </section>
    </main>
  );
}
