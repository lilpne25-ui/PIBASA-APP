import { NextResponse, type NextRequest } from "next/server";
import { canAccessApi, canAccessUi, isPublicPath } from "@/domain/auth/access-policy";
import { permissionsForRole } from "@/domain/auth/permissions";
import { HmacSessionCodec } from "@/infrastructure/auth/hmac-session-codec";

const COOKIE_NAME = "pibasa_session";

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
