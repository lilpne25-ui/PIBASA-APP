# Revision de seguridad — Atomo 1 (auth, RBAC, datos de clientes)

Fecha: 2026-10-07. Alcance: codigo de `app/` tal como queda en este atomo. Revision hecha por el agente (no es auditoria externa).

## Verificado con pruebas automaticas (26 tests) y humo local
- Token de sesion: rechaza firma de otro secreto, payload manipulado (escalada de rol), expirado y basura.
- Contrasenas: scrypt con sal, formatos malformados no lanzan; minimo 12 caracteres.
- Login: respuesta identica para usuario inexistente y contrasena mala; usuario inactivo/sin hash rechazado; bloqueo tras 5 fallos y expiracion del bloqueo; la auditoria nunca guarda contrasenas.
- RBAC: API default-deny (SALES recibe 403 en `/api/users`, sin sesion 401), cookie falsa 401, origen ajeno en login 403, cuerpo invalido 400. Cabeceras `nosniff`, `X-Frame-Options: DENY`, HSTS presentes.
- Humo con `next start` (sin base de datos): flujo de middleware correcto.

## Verificado despues (Atomo 2) contra PostgreSQL 16 real
- Migracion aplicada con `prisma migrate deploy`; login correcto (200) y fallido (401), cookie valida en `/api/auth/me`, bloqueo tras 5 fallos (429, tambien con la contrasena correcta) y auditoria registrada en `AuditLog`.

## NO verificado
- Pruebas de penetracion, SAST dedicado, revision de secretos en el historial (no hay git aun).

## Hallazgos y remediacion
| # | Hallazgo | Severidad | Estado |
|---|---|---|---|
| 1 | `npm audit` (prod): Next 15.5 trae postcss vulnerable (XSS en stringify / lectura de .map); solo se explota procesando CSS no confiable en build, que no ocurre aqui. Arreglo requiere Next 16 (cambio mayor) | Moderada | Aceptado temporalmente; migrar a Next 16 en Atomo 10 |
| 2 | `npm audit`: prisma CLI -> deepmerge-ts, tailwind/eslint-config-next -> glob/chokidar/braces (herramientas de build/dev, no se ejecutan en runtime) | Alta (solo dev) | Aceptado; revisar en Atomo 10 |
| 3 | Vitest/tinypool critico: corregido subiendo a vitest 5 | Critica | Resuelto |
| 4 | Sesion sin revocacion: usuario desactivado conserva sesion hasta 8 h | Media | Pendiente Atomo 9 (validar contra DB en acciones sensibles) |
| 5 | Sin limite de intentos por IP (solo por cuenta). Permite enumerar cuentas bloqueando a un usuario (DoS dirigido) | Media | Mitigar con Cloudflare rate limiting + limite por IP en Atomo 10 |
| 6 | Sin CSP | Baja/Media | Atomo 10 |
| 7 | Fuentes desde Google Fonts en build (dependencia de red; privacidad menor) | Baja | Evaluar autoalojar fuentes |
| 8 | Login sin MFA | Baja (uso interno) | Valorar con el cliente |

## Reglas para atomos siguientes
- Todo endpoint nuevo: regla en `apiRules` + validacion zod + prueba de 401/403.
- Rutas publicas (catalogo, consulta por folio, webhook WhatsApp) requieren revision antes de agregarse a `publicPaths`: la consulta por folio debe usar folios no adivinables (token aleatorio, no secuencial) y mostrar solo lo minimo.
- Webhook de Meta: validar firma `X-Hub-Signature-256` con `META_APP_SECRET` e idempotencia.
