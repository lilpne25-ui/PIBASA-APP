import Link from "next/link";

export default function AccessDeniedPage() {
  return (
    <main className="mx-auto grid min-h-dvh max-w-xl place-content-center px-6 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-danger">403</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight">Acceso denegado</h1>
      <p className="mt-3 text-steel-300">Tu rol no tiene permiso para ver esta seccion.</p>
      <Link href="/" className="mt-8 text-signal underline-offset-4 hover:underline">
        Volver al panel
      </Link>
    </main>
  );
}
