# Revision de seguridad - Atomo D (demo guiada)

Superficie nueva: `/demo` (SSR, solo lectura, publica) y MP3 estaticos bajo `/demo/narration/`.
- Sin endpoints de escritura ni formularios que envien datos: toda simulacion ocurre en el navegador; la calculadora no guarda ni transmite valores.
- Datos: solo el DTO publico del catalogo (sin ids, precios ni fechas). Los precios y cifras de la demo son constantes ilustrativas.
- `/demo` se agrega a `publicPrefixes` (coincidencia por segmento; `/demos`, `/demo-admin` y `/api/demo` no son publicas; hay prueba). Hereda el rate limit de 90/min por IP (limitacion conocida: en memoria, reforzar en Cloudflare).
- Voz: el navegador solo reproduce MP3 locales; la llave de ElevenLabs solo se lee en `scripts/generate-voice.mjs` desde el entorno, no se imprime (en errores solo el codigo HTTP) ni se versiona.
- Enlace externo: solo `/catalogo` con `rel="noopener noreferrer"`. CSP de produccion (`default-src 'self'`) cubre audio e imagenes locales.
- `noindex` en la pagina.
