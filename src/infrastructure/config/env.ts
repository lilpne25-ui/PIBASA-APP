import { z } from "zod";

const schema = z.object({
  DATABASE_URL: z.string().min(1),
  AUTH_SECRET: z.string().min(32, "AUTH_SECRET debe tener al menos 32 caracteres"),
  AUTH_SECURE_COOKIE: z.enum(["0", "1"]).default("0")
});

export type AppEnv = z.infer<typeof schema>;

let cached: AppEnv | null = null;

/** Valida el entorno al primer uso (no en build). Falla con mensaje claro sin imprimir valores. */
export function getEnv(): AppEnv {
  if (cached) return cached;
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const fields = parsed.error.issues.map((i) => i.path.join(".")).join(", ");
    throw new Error(`Configuracion de entorno invalida: ${fields}`);
  }
  cached = parsed.data;
  return cached;
}
