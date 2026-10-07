export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/infrastructure/persistence/prisma-client";

/** Publico y minimo: no expone versiones, rutas ni detalles de error. */
export async function GET() {
  let db: "ok" | "down" = "ok";
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    db = "down";
  }
  return NextResponse.json({ status: db === "ok" ? "ok" : "degraded", db }, { status: db === "ok" ? 200 : 503 });
}
