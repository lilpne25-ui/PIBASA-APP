# Arquitectura (Atomo 1)

## Capas (hexagonal)
```
src/domain/          Reglas puras: roles, permisos, politica de acceso. Sin framework ni DB.
src/application/     Casos de uso + puertos (interfaces): UserRepository, PasswordHasher, AuditLog, SessionCodec, Clock.
src/infrastructure/  Adaptadores: Prisma, scrypt, HMAC (Web Crypto), env (zod), container.ts (raiz de composicion).
src/app/, src/middleware.ts, src/lib/   Borde web (Next): rutas, paginas, cookies.
```
Regla de dependencia: domain <- application <- infrastructure/app. `domain` y `application` no importan Next, Prisma ni `node:`.

## Dominios previstos (se agregan por atomo)
Catalogo (A2 modelo y lectura interna; A3 UI publica), Cotizacion (A4), Seguimiento (A5), Envios (A7), Mensajeria WhatsApp (A6/A12). Cada uno con su carpeta en domain/application y sus puertos.

## Decisiones
- **Sesion**: token HMAC-SHA256 en cookie HttpOnly/SameSite=Lax (8 h). Se usa Web Crypto para compartir codigo entre Node y Edge (middleware). Los permisos NO viajan en el token: se derivan del rol en cada request, asi un cambio en la matriz aplica de inmediato. Limitacion: un usuario desactivado conserva su sesion hasta que expire (<= 8 h) hasta que el Atomo 9 agregue validacion contra DB en operaciones sensibles.
- **Passwords**: scrypt (N=16384), minimo 12 caracteres; verificacion contra hash ficticio cuando el usuario no existe para igualar tiempos.
- **Anti fuerza bruta**: 5 fallos => bloqueo 15 min por cuenta (en DB, funciona con varias instancias). Falta limite por IP (ver SEGURIDAD).
- **Default-deny** en API (`apiRules`); UI sin regla exige `dashboard.view`.
- **Prisma 6 / Postgres**: JSONB solo se usa en `AuditLog.metadata`. Partidas, precios y estados de cotizacion iran relacionales.
- **Next 15** (no 16) por estabilidad del middleware y `next lint`; migrar a 16 esta en el plan del Atomo 10 (advisory de postcss embebido).
- **WhatsApp**: Meta Cloud API oficial (Baileys descartado para produccion). Aun no integrado; variables en `.env.example`.
- **Marca**: paleta derivada de los logos VLUX (ver comentario en `tailwind.config.ts`; el cian es estimacion visual). El logo de Pibasa aun no existe; la marca principal de la app sera Pibasa y VLUX aparece como credito de autoria.
