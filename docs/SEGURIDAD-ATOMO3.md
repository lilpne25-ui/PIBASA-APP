# Revision de seguridad — Atomo 3 (catalogo PUBLICO)

Fecha: 2026-10-07. Superficie nueva: `/catalogo` y `/catalogo/[slug]` (SSR, solo lectura, sin sesion), `/robots.txt`, `/sitemap.xml`.

## Controles
- **Solo lectura, sin API publica**: no hay endpoints publicos ni parametros que escriban. `/api/**` sigue exigiendo sesion y default-deny (verificado: `/api/catalog/grades`, `/api/auth/me` y `/api/users` devuelven 401 sin sesion; `/` redirige a `/login`).
- **Lista blanca de rutas**: `publicPrefixes = ["/catalogo"]` coincide por segmento (`/catalogox`, `/catalogo-admin` y `/api/catalog` NO son publicas; hay pruebas).
- **DTO publico** (`src/application/catalog/public-catalog.ts`): sin ids internos, fechas, `dataSource` crudo, estado de activacion ni precios. Una prueba fija las llaves permitidas y otra verifica que no se filtra un id interno.
- **Entradas**: familia (`^[A-Z_]{1,30}$`), forma (enum), busqueda (max 60 caracteres) y slug (`^[a-z0-9-]{1,40}$`) se validan antes de llegar a Prisma; las consultas son parametrizadas (Prisma). Probado: inyeccion SQL en `q` devuelve 0 resultados; slug con `../` devuelve 404; `q` de 3000 caracteres responde 200 sin error.
- **Rate limiting**: 90 peticiones/min por IP a `/catalogo/**` (429 con `Retry-After`). Verificado: 429 en la peticion 91; otra IP no se ve afectada. **Limitacion**: contador en memoria por instancia y la IP sale de `X-Forwarded-For` (confiable solo detras de Vercel/Cloudflare). Hay que reforzarlo con reglas de rate limiting en Cloudflare antes de produccion.
- **CSP** (solo en produccion): `default-src 'self'`, `frame-ancestors 'none'`, `object-src 'none'`, `base-uri/form-action 'self'`. Usa `'unsafe-inline'` en script/style porque Next sin nonces lo necesita; migrar a nonces en el Atomo 10. Mas `X-Frame-Options`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, HSTS.
- **SEO controlado**: metadata y titulo por grado, canonical. Mientras el dato sea EXAMPLE las paginas llevan `noindex` y el sitemap queda vacio; al marcar un grado VERIFIED se indexa solo.
- **CTA**: el boton usa `NEXT_PUBLIC_WHATSAPP_NUMBER` (solo digitos, validado con regex) y abre `wa.me` con `rel="noopener noreferrer"`; no se envia nada desde el servidor. Sin variable, muestra un aviso.
- **Datos**: nada de clientes ni de usuarios en estas rutas.

## Pendiente / riesgos
| # | Hallazgo | Severidad | Plan |
|---|---|---|---|
| 1 | Rate limit en memoria por instancia | Media | Cloudflare rate limiting + considerar almacen compartido (Atomo 10/11) |
| 2 | CSP con `unsafe-inline` | Baja/Media | Nonces (Atomo 10) |
| 3 | Scraping del catalogo | Baja | Aceptable: sin precios; vigilar con Cloudflare |
| 4 | Paginas dinamicas consultan la BD por visita | Baja | Cache/ISR cuando haya datos VERIFIED y trafico real |
| 5 | Hallazgos previos (Next 15 + postcss, sesion sin revocacion, etc.) | ver `SEGURIDAD-ATOMO1.md` | Atomos 9 y 10 |
