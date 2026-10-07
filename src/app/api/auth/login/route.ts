export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticateUser } from "@/infrastructure/container";
import { setSessionCookie } from "@/lib/session";

const bodySchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(256)
});

function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true; // clientes no-navegador; la cookie es SameSite=Lax
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Origen no permitido." }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos de acceso invalidos." }, { status: 400 });
  }

  try {
    const result = await getAuthenticateUser().execute(parsed.data);

    if (!result.ok) {
      if (result.reason === "locked") {
        return NextResponse.json(
          { error: "Demasiados intentos. Espera unos minutos e intenta de nuevo." },
          { status: 429 }
        );
      }
      return NextResponse.json({ error: "Correo o contrasena incorrectos." }, { status: 401 });
    }

    const { id, email, name, role } = result.user;
    await setSessionCookie({ sub: id, email, name, role });
    return NextResponse.json({ user: { id, email, name, role } });
  } catch (error) {
    console.error("login_error", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "No fue posible iniciar sesion." }, { status: 500 });
  }
}
