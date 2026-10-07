export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { z } from "zod";
import { shapeTypes } from "@/domain/catalog/shapes";
import { getListGrades } from "@/infrastructure/container";

const querySchema = z.object({
  family: z.string().trim().max(40).optional(),
  shape: z.enum(shapeTypes).optional(),
  q: z.string().trim().max(60).optional()
});

export async function GET(request: Request) {
  const params = Object.fromEntries(new URL(request.url).searchParams);
  const parsed = querySchema.safeParse(params);
  if (!parsed.success) return NextResponse.json({ error: "Parametros invalidos." }, { status: 400 });
  const grades = await getListGrades().execute({
    familyCode: parsed.data.family,
    shape: parsed.data.shape,
    q: parsed.data.q
  });
  return NextResponse.json({ grades });
}
