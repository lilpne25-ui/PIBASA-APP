import { isAppRole } from "@/domain/auth/permissions";
import type { SessionClaims, SessionCodec } from "@/application/auth/ports";

export const SESSION_MAX_AGE_SECONDS = 8 * 60 * 60;
const encoder = new TextEncoder();

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array<ArrayBuffer> {
  let b64 = value.replace(/-/g, "+").replace(/_/g, "/");
  while (b64.length % 4 !== 0) b64 += "=";
  const binary = atob(b64);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

/**
 * Token firmado HMAC-SHA256 con Web Crypto: misma implementacion en Node y en el runtime Edge
 * del middleware. El rol viaja en el token; los PERMISOS se derivan del rol en cada request
 * (no se confia en permisos dentro del token).
 */
export class HmacSessionCodec implements SessionCodec {
  constructor(private readonly secret: string) {
    if (secret.length < 32) throw new Error("AUTH_SECRET debe tener al menos 32 caracteres.");
  }

  private key(usage: "sign" | "verify") {
    return crypto.subtle.importKey(
      "raw",
      encoder.encode(this.secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      [usage]
    );
  }

  async sign(claims: Omit<SessionClaims, "iat" | "exp">, nowMs = Date.now()): Promise<string> {
    const iat = Math.floor(nowMs / 1000);
    const payload: SessionClaims = { ...claims, iat, exp: iat + SESSION_MAX_AGE_SECONDS };
    const body = toBase64Url(encoder.encode(JSON.stringify(payload)));
    const sig = await crypto.subtle.sign("HMAC", await this.key("sign"), encoder.encode(body));
    return `${body}.${toBase64Url(new Uint8Array(sig))}`;
  }

  async verify(token: string, nowMs = Date.now()): Promise<SessionClaims | null> {
    try {
      const parts = token.split(".");
      if (parts.length !== 2) return null;
      const [body, sig] = parts as [string, string];
      const valid = await crypto.subtle.verify(
        "HMAC",
        await this.key("verify"),
        fromBase64Url(sig),
        encoder.encode(body)
      );
      if (!valid) return null;
      const p = JSON.parse(new TextDecoder().decode(fromBase64Url(body))) as Partial<SessionClaims>;
      if (
        typeof p.sub !== "string" ||
        typeof p.email !== "string" ||
        typeof p.name !== "string" ||
        !isAppRole(p.role) ||
        typeof p.iat !== "number" ||
        typeof p.exp !== "number"
      ) {
        return null;
      }
      if (p.exp <= Math.floor(nowMs / 1000)) return null;
      return { sub: p.sub, email: p.email, name: p.name, role: p.role, iat: p.iat, exp: p.exp };
    } catch {
      return null;
    }
  }
}
