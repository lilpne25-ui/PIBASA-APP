// Dominio de identidad: roles y permisos. Sin dependencias de framework ni de base de datos.

export const appRoles = ["ADMIN", "SALES", "OPERATIONS"] as const;
export type AppRole = (typeof appRoles)[number];

export const permissionKeys = [
  "dashboard.view",
  "catalog.view",
  "catalog.edit",
  "pricing.view",
  "pricing.edit",
  "quotes.view",
  "quotes.create",
  "quotes.edit",
  "quotes.pdf",
  "users.view",
  "users.manage",
  "audit.view"
] as const;
export type PermissionKey = (typeof permissionKeys)[number];

/**
 * Matriz rol -> permisos. PROPUESTA inicial, sujeta a validacion con Pibasa:
 * - ADMIN: todo.
 * - SALES (vendedor): cotiza y consulta catalogo/precios, no los edita.
 * - OPERATIONS (almacen/operacion): mantiene catalogo y precios, ve cotizaciones.
 */
export const rolePermissions: Record<AppRole, readonly PermissionKey[]> = {
  ADMIN: permissionKeys,
  SALES: [
    "dashboard.view",
    "catalog.view",
    "pricing.view",
    "quotes.view",
    "quotes.create",
    "quotes.edit",
    "quotes.pdf"
  ],
  OPERATIONS: [
    "dashboard.view",
    "catalog.view",
    "catalog.edit",
    "pricing.view",
    "pricing.edit",
    "quotes.view"
  ]
};

export function isAppRole(value: unknown): value is AppRole {
  return typeof value === "string" && (appRoles as readonly string[]).includes(value);
}

export function permissionsForRole(role: AppRole): PermissionKey[] {
  return [...rolePermissions[role]];
}
