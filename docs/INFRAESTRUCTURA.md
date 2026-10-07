# Infraestructura propuesta (Atomo 1) — costo-eficiente

Nada de esto esta desplegado ni contratado. Precios NO verificados hoy; validar en los sitios oficiales antes de decidir.

| Pieza | Propuesta | Razon |
|---|---|---|
| App Next.js | Vercel (Hobby para demo; Pro si el uso es comercial) | Stack por defecto Levet/VLUX. Revisar terminos: el plan Hobby es no comercial. |
| DNS / CDN / WAF | Cloudflare (plan gratuito) | Stack por defecto; proteccion basica y rate limiting. |
| PostgreSQL | Neon o Supabase (nivel gratuito/bajo), region cercana (us-east / us-central) | Postgres gestionado sin operar servidores. Usar conexion pooled para serverless. |
| Dominio | Por definir con el cliente (acerospibasa.com figura en su ficha de Google pero no resuelve; confirmar si es suyo) | |
| WhatsApp | Meta Cloud API (oficial) | Tarifas por conversacion/plantilla segun Meta. Requiere verificacion de negocio. |
| Secretos | Variables de entorno en Vercel; nunca en el repo | |

Entornos: `local` (docker-compose), `preview` (Vercel, BD separada) y `production`. Migraciones con `prisma migrate deploy` en el pipeline de despliegue.
Pendiente de decision: region de BD, plan de Vercel y quien es titular de las cuentas (VLUX/Levet vs cliente).
