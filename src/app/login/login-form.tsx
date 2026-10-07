"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/** Solo permite rutas internas relativas como destino post-login (evita open redirect). */
function safeNext(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return "/";
  return value;
}

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.get("email"), password: form.get("password") })
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(data?.error ?? "No fue posible iniciar sesion.");
        return;
      }
      router.replace(safeNext(params.get("next")));
      router.refresh();
    } catch {
      setError("Sin conexion con el servidor.");
    } finally {
      setPending(false);
    }
  }

  const field =
    "mt-2 w-full rounded-lg border border-ink-600 bg-ink-950 px-4 py-3 text-steel-100 transition-colors duration-200 placeholder:text-steel-500 focus:border-signal";

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-5" noValidate>
      <label className="block text-sm text-steel-300">
        Correo
        <input name="email" type="email" autoComplete="username" required className={field} />
      </label>
      <label className="block text-sm text-steel-300">
        Contrasena
        <input name="password" type="password" autoComplete="current-password" required className={field} />
      </label>
      <p role="alert" aria-live="polite" className="min-h-5 text-sm text-danger">
        {error}
      </p>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-signal px-4 py-3 font-medium text-ink-950 transition-transform duration-200 ease-spring hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] disabled:opacity-60"
      >
        {pending ? "Verificando..." : "Entrar"}
      </button>
    </form>
  );
}
