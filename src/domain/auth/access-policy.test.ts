import { describe, expect, it } from "vitest";
import { canAccessApi, canAccessUi, isPublicPath, isRateLimitedPublicPath, type AccessRule } from "./access-policy";
import { permissionsForRole, rolePermissions, permissionKeys } from "./permissions";

const testApiRules: AccessRule[] = [
  { path: "/api/users", read: "users.view", write: "users.manage" },
  { path: "/api/quotes", read: "quotes.view", write: "quotes.edit" }
];

describe("matriz de permisos", () => {
  it("ADMIN tiene todos los permisos", () => {
    expect(permissionsForRole("ADMIN")).toEqual([...permissionKeys]);
  });
  it("SALES y OPERATIONS no gestionan usuarios", () => {
    expect(rolePermissions.SALES).not.toContain("users.manage");
    expect(rolePermissions.OPERATIONS).not.toContain("users.manage");
  });
  it("SALES no edita precios; OPERATIONS si", () => {
    expect(rolePermissions.SALES).not.toContain("pricing.edit");
    expect(rolePermissions.OPERATIONS).toContain("pricing.edit");
  });
});

describe("politica de acceso API", () => {
  it("es default-deny para rutas sin regla", () => {
    expect(canAccessApi(permissionsForRole("ADMIN"), "/api/desconocida", "GET", testApiRules)).toBe(false);
  });
  it("lectura y escritura usan permisos distintos", () => {
    const sales = permissionsForRole("SALES");
    expect(canAccessApi(sales, "/api/quotes", "GET", testApiRules)).toBe(true);
    expect(canAccessApi(sales, "/api/quotes", "POST", testApiRules)).toBe(true);
    expect(canAccessApi(sales, "/api/users", "GET", testApiRules)).toBe(false);
    const ops = permissionsForRole("OPERATIONS");
    expect(canAccessApi(ops, "/api/quotes", "POST", testApiRules)).toBe(false);
  });
  it("no confunde prefijos parecidos", () => {
    expect(canAccessApi(permissionsForRole("ADMIN"), "/api/usersx", "GET", testApiRules)).toBe(false);
  });
  it("catalogo: SALES/OPERATIONS leen; solo quien tiene catalog.edit escribe", () => {
    expect(canAccessApi(permissionsForRole("SALES"), "/api/catalog/grades", "GET")).toBe(true);
    expect(canAccessApi(permissionsForRole("SALES"), "/api/catalog/grades", "POST")).toBe(false);
    expect(canAccessApi(permissionsForRole("OPERATIONS"), "/api/catalog/grades/d2", "PATCH")).toBe(true);
    expect(canAccessApi([], "/api/catalog/grades", "GET")).toBe(false);
  });
  it("/api/auth/me exige solo sesion", () => {
    expect(canAccessApi([], "/api/auth/me", "GET")).toBe(true);
  });
});

describe("politica de acceso UI", () => {
  it("raiz exige dashboard.view", () => {
    expect(canAccessUi([], "/")).toBe(false);
    expect(canAccessUi(["dashboard.view"], "/")).toBe(true);
  });
  it("rutas sin regla requieren dashboard.view", () => {
    expect(canAccessUi([], "/lo-que-sea")).toBe(false);
  });
});

describe("rutas publicas", () => {
  it("solo las declaradas", () => {
    expect(isPublicPath("/login")).toBe(true);
    expect(isPublicPath("/api/health")).toBe(true);
    expect(isPublicPath("/api/auth/me")).toBe(false);
    expect(isPublicPath("/login/../api/users")).toBe(false);
  });
  it("catalogo publico: la ruta y sus subrutas, sin colarse a otras", () => {
    expect(isPublicPath("/catalogo")).toBe(true);
    expect(isPublicPath("/catalogo/d2")).toBe(true);
    expect(isPublicPath("/robots.txt")).toBe(true);
    expect(isPublicPath("/catalogox")).toBe(false);
    expect(isPublicPath("/catalogo-admin")).toBe(false);
    expect(isPublicPath("/api/catalog/grades")).toBe(false);
    expect(isPublicPath("/")).toBe(false);
    expect(isRateLimitedPublicPath("/catalogo/h13")).toBe(true);
    expect(isRateLimitedPublicPath("/login")).toBe(false);
  });
});
