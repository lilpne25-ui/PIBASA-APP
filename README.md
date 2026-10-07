# Pibasa Cotizador (VLUX x Levet Labs)

Catalogo tecnico de aceros, cotizador y seguimiento para Aceros y Servicios Pibasa.
Estado: **Atomo 3 (catalogo publico)** sobre catalogo (A2) y cimientos (A1). Aun no hay cotizador; ver `MSA-ATOMOS.md` del proyecto.

## Que incluye hoy
- Next.js 15 (App Router) + React 19 + TypeScript estricto + Tailwind 3.
- PostgreSQL + Prisma 6: `User` (con bloqueo por intentos) y `AuditLog`.
- Autenticacion propia: scrypt + sesion firmada HMAC (cookie HttpOnly), RBAC por rol (`ADMIN`, `SALES`, `OPERATIONS`), API **default-deny**.
- Arquitectura hexagonal: `src/domain` (reglas puras) -> `src/application` (casos de uso y puertos) -> `src/infrastructure` (adaptadores Prisma/crypto/env) -> `src/app` (Next).
- Catalogo publico `/catalogo` (sin login, DTO publico, rate limiting, CSP en produccion) y catalogo tecnico (modelo + API de lectura interna): grados, familias, formas, medidas, equivalencias, aplicaciones, peso teorico. Datos de EJEMPLO marcados `EXAMPLE` (ver `docs/CATALOGO.md`).
- Pruebas (Vitest), CI (`.github/workflows/ci.yml`), cabeceras de seguridad, `/api/health`.

## Arranque local
```bash
cp .env.example .env        # rellena AUTH_SECRET (>=32 chars) y SEED_ADMIN_*
docker compose up -d        # PostgreSQL local
npm ci
npm run prisma:deploy       # aplica migraciones
npm run db:seed             # crea el primer ADMIN desde SEED_ADMIN_*
npm run db:seed:catalog     # carga el catalogo de EJEMPLO (idempotente)
npm run dev
```
Verificacion completa: `npm run verify` (lint + typecheck + tests + build). Pruebas contra DB real: `RUN_DB_TESTS=1 npm test` (con el catalogo cargado).

### Nota Windows (entornos con ruta virtualizada, p. ej. apps de la Microsoft Store)
Si `esbuild`/`prisma migrate` fallan con `spawn ENOENT`, define `ESBUILD_BINARY_PATH` y `PRISMA_SCHEMA_ENGINE_BINARY` con la ruta real (no virtualizada) de los .exe en `node_modules`.

## Reglas del proyecto
- Rutas publicas solo en `src/domain/auth/access-policy.ts` (`publicPaths`) y con revision de seguridad.
- Nuevas rutas API: agregar regla en `apiRules`; sin regla = 403.
- Nunca subir `.env`, sesiones de WhatsApp ni datos de clientes.
- Origen: base propia de Levet Labs / VLUX (patrones de auth y WhatsApp reescritos). Sin historial git, marca ni datos de proyectos de otros clientes.

Documentos: `docs/CATALOGO.md`, `docs/SEGURIDAD-ATOMO3.md`, `docs/ARQUITECTURA.md`, `docs/INFRAESTRUCTURA.md`, `docs/SEGURIDAD-ATOMO1.md`.
