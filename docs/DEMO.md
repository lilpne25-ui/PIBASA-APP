# Demo guiada con voz (Atomo D)

- Ruta publica: `/demo` (sin login, con rate limit como `/catalogo`). Lee el catalogo REAL por el DTO publico; si la base no responde usa una muestra minima de D2 y lo avisa en pantalla.
- Simulado localmente (en el navegador, sin guardar nada): cotizador, folio, mensaje a WhatsApp, panel de seguimiento, vista del dueno, calculadora. Cada pantalla lo marca; la narracion lo dice.
- Guion: `src/demo/narration.json` (fuente unica; `src/demo/scenes.ts` lo importa). Pasos, resaltado y subtitulos se calculan como fraccion del avance de la escena, por lo que siempre coinciden con la duracion real del MP3 (o con el temporizador de lectura si falta).
- Audio: `public/demo/narration/<id>-<mujer|hombre>.mp3`. Si falta un MP3 la demo sigue con subtitulos ("Audio pendiente - lectura"). No se usa otro motor de voz como respaldo.

## Generar la voz (ElevenLabs)
```
ELEVENLABS_API_KEY=...  ELEVENLABS_VOICE_ID_MUJER=...  ELEVENLABS_VOICE_ID_HOMBRE=...   (opcional ELEVENLABS_MODEL_ID)
npm run demo:voice -- --dry-run     # lista los 20 archivos esperados
npm run demo:voice                  # genera los que falten (--force, --only <id>)
```
La llave solo se lee del entorno (o de `.env`, ignorado por git); nunca se imprime. Tras generar, revisar duraciones (`ffprobe`) y escuchar al menos una escena por voz.

## Marca
`scripts/generar_logo_vlux.py` convierte el JPG con fondo negro en PNG con transparencia (`vlux-mark.png`, `vlux-icon.png`); `VluxMark` los integra con resplandor y opacidad reducida, sin placa. Pibasa usa wordmark tipografico hasta recibir su logo.
