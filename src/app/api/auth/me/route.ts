export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";

export async function GET() {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "Sesion requerida." }, { status: 401 });
  const { sub, email, name, role, permissions } = session;
  return NextResponse.json({ user: { id: sub, email, name, role, permissions } });
}
