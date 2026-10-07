export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getGetGradeDetail } from "@/infrastructure/container";

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const grade = await getGetGradeDetail().execute(slug);
  if (!grade) return NextResponse.json({ error: "Grado no encontrado." }, { status: 404 });
  return NextResponse.json({ grade });
}
