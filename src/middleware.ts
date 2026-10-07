import { NextResponse, type NextRequest } from "next/server";
import { canAccessApi, canAccessUi, isPublicPath, isRateLimitedPublicPath } from "@/domain/auth/access-policy";
import { permissionsForRole } from "@/domain/auth/permissions";
import { FixedWindowRateLimiter } from "@/domain/security/rate-limiter";
import { HmacSessionCodec } from "@/infrastructure/auth/hmac-session-codec";

const COOKIE_NAME = "pibasa_session";

// 90 peticiones/min por IP al catalogo publico. En memoria por instancia: ver docs/SEGURIDAD-ATOMO3.md
// (el limite real debe reforzarse en Cloudflare). La IP viene de la cabecera del proxy (Vercel/Cloudflare).
const publicLimiter = new FixedWindowRateLimiter(90, 60_000);

function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return (forwarded || request.headers.get("x-real-ip") || "unknown").slice(0, 64);
}

async function readSession(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const secret = process.env.AUTH_SECRET?.trim() ?? "";
  if (!token || secret.length < 32) return null;
  return new HmacSessionCodec(secret).verify(token);
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const session = await readSession(request);

  if (pathname === "/login" && session) return NextResponse.redirect(new URL("/", request.url));
  if (isRateLimitedPublicPath(pathname)) {
    const decision = publicLimiter.check(clientIp(request));
    if (!decision.allowed) {
      return new NextResponse("Demasiadas solicitudes. Intenta de nuevo en unos segundos.", {
        status: 429,
        headers: { "Retry-After": String(decision.retryAfterSeconds), "Content-Type": "text/plain; charset=utf-8" }
      });
    }
  }
  if (isPublicPath(pathname)) return NextResponse.next();

  const isApi = pathname.startsWith("/api/");

  if (!session) {
    if (isApi) return NextResponse.json({ error: "Sesion requerida." }, { status: 401 });
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  const permissions = permissionsForRole(session.role);

  if (isApi) {
    return canAccessApi(permissions, pathname, request.method)
      ? NextResponse.next()
      : NextResponse.json({ error: "No tienes permisos para esta accion." }, { status: 403 });
  }

  return canAccessUi(permissions, pathname)
    ? NextResponse.next()
    : NextResponse.redirect(new URL("/acceso-denegado", request.url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"]
};
