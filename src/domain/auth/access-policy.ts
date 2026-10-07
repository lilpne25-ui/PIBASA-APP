import type { PermissionKey } from "./permissions";

export type AccessRule = {
  /** Prefijo de ruta (o ruta exacta si exact=true). */
  path: string;
  exact?: boolean;
  /** Permiso para lectura (GET/HEAD/OPTIONS) o para cualquier metodo en rutas UI. */
  read: PermissionKey | "authenticated";
  /** Permiso para escritura (POST/PUT/PATCH/DELETE) en rutas API. Por defecto igual a read. */
  write?: PermissionKey | "authenticated";
};

/**
 * Rutas publicas (sin sesion). Cada atomo futuro agrega aqui SOLO lo que deba ser publico
 * (catalogo publico, consulta de cotizacion por folio, webhook de WhatsApp) y debe pasar
 * por revision de seguridad.
 */
export const publicPaths: readonly string[] = [
  "/login",
  "/api/auth/login",
  "/api/auth/logout",
  "/api/health",
  "/robots.txt",
  "/sitemap.xml"
];

/**
 * Prefijos publicos de SOLO LECTURA (la ruta y sus subrutas). El catalogo publico (Atomo 3) no tiene
 * endpoints de escritura ni de API: son paginas renderizadas en servidor con DTO publico.
 */
export const publicPrefixes: readonly string[] = ["/catalogo"];

/** Rutas publicas que ademas llevan limite de peticiones por IP. */
export function isRateLimitedPublicPath(pathname: string): boolean {
  return publicPrefixes.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export const uiRules: readonly AccessRule[] = [
  { path: "/", exact: true, read: "dashboard.view" },
  { path: "/acceso-denegado", read: "authenticated" }
  // Atomos siguientes: /usuarios, /cotizaciones, /precios, /catalogo-admin ...
];

export const apiRules: readonly AccessRule[] = [
  { path: "/api/auth/me", exact: true, read: "authenticated" },
  // Catalogo: lectura interna. El catalogo PUBLICO se decide en el Atomo 3. Escritura: Atomo 9.
  { path: "/api/catalog", read: "catalog.view", write: "catalog.edit" }
  // Atomos siguientes: /api/users, /api/quotes, /api/pricing ...
];

const READ_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export function isPublicPath(pathname: string): boolean {
  return publicPaths.includes(pathname) || isRateLimitedPublicPath(pathname);
}

function matches(rule: AccessRule, pathname: string): boolean {
  if (rule.exact) return pathname === rule.path;
  return pathname === rule.path || pathname.startsWith(rule.path + "/");
}

function satisfies(
  required: PermissionKey | "authenticated",
  granted: readonly PermissionKey[]
): boolean {
  return required === "authenticated" || granted.includes(required);
}

/** UI: sin regla => se exige dashboard.view (usuario interno valido). */
export function canAccessUi(
  granted: readonly PermissionKey[],
  pathname: string,
  rules: readonly AccessRule[] = uiRules
): boolean {
  const rule = rules.find((r) => matches(r, pathname));
  return satisfies(rule ? rule.read : "dashboard.view", granted);
}

/** API: DEFAULT-DENY. Sin regla explicita => false. */
export function canAccessApi(
  granted: readonly PermissionKey[],
  pathname: string,
  method: string,
  rules: readonly AccessRule[] = apiRules
): boolean {
  const rule = rules.find((r) => matches(r, pathname));
  if (!rule) return false;
  const isRead = READ_METHODS.has(method.toUpperCase());
  const required = isRead ? rule.read : (rule.write ?? rule.read);
  return satisfies(required, granted);
}
