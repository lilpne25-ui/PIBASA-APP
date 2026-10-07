/**
 * Limitador de ventana fija, en memoria. Suficiente como primera barrera para rutas publicas de lectura.
 * LIMITACION: en serverless (Vercel) cada instancia tiene su propio contador; el limite real debe ponerse
 * tambien en Cloudflare (reglas de rate limiting). Documentado en docs/SEGURIDAD-ATOMO3.md.
 */
export type RateDecision = { allowed: boolean; remaining: number; retryAfterSeconds: number };

export class FixedWindowRateLimiter {
  private readonly hits = new Map<string, { count: number; resetAt: number }>();

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
    private readonly maxKeys = 5000
  ) {}

  check(key: string, nowMs = Date.now()): RateDecision {
    if (this.hits.size >= this.maxKeys) this.evict(nowMs);

    let entry = this.hits.get(key);
    if (!entry || entry.resetAt <= nowMs) {
      entry = { count: 0, resetAt: nowMs + this.windowMs };
      this.hits.set(key, entry);
    }
    entry.count += 1;

    const allowed = entry.count <= this.limit;
    return {
      allowed,
      remaining: Math.max(0, this.limit - entry.count),
      retryAfterSeconds: allowed ? 0 : Math.max(1, Math.ceil((entry.resetAt - nowMs) / 1000))
    };
  }

  /** Libera memoria: primero vencidos; si sigue lleno, descarta las entradas mas antiguas. */
  private evict(nowMs: number) {
    for (const [k, v] of this.hits) if (v.resetAt <= nowMs) this.hits.delete(k);
    if (this.hits.size >= this.maxKeys) {
      const excess = this.hits.size - Math.floor(this.maxKeys * 0.9);
      let i = 0;
      for (const k of this.hits.keys()) {
        if (i++ >= excess) break;
        this.hits.delete(k);
      }
    }
  }
}
