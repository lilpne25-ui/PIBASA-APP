import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/session";
import { VluxCredit } from "@/components/vlux-credit";
import { SignOutButton } from "@/components/sign-out-button";

export const dynamic = "force-dynamic";

const roleLabel = { ADMIN: "Administrador", SALES: "Ventas", OPERATIONS: "Operacion" } as const;

export default async function HomePage() {
  const session = await getCurrentSession();
  if (!session) redirect("/login");

  return (
    <main className="mx-auto max-w-5xl px-6 py-14">
      <header className="rise-in flex items-start justify-between gap-6">
        <div>
          <p className="eyebrow">Pibasa / panel</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">Hola, {session.name}</h1>
          <p className="mt-2 text-steel-300">
            Rol: {roleLabel[session.role]} · {session.permissions.length} permisos activos
          </p>
        </div>
        <SignOutButton />
      </header>

      <section className="panel rise-in rise-in-2 mt-12 p-8">
        <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-steel-500">Estado del sistema</h2>
        <p className="mt-4 text-steel-300">
          Acceso, roles, base de datos y catalogo tecnico listos. El cotizador y el seguimiento se construyen en
          los siguientes atomos; este panel no muestra cifras de ejemplo.
        </p>
        <ul className="mt-6 flex flex-wrap gap-2">
          {session.permissions.map((p) => (
            <li key={p} className="rounded-full border border-ink-600 px-3 py-1 font-mono text-xs text-steel-300">
              {p}
            </li>
          ))}
        </ul>
      </section>

      <footer className="mt-16">
        <VluxCredit />
      </footer>
    </main>
  );
}
