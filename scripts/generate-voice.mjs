// Genera la narracion de la demo con ElevenLabs (text-to-speech): public/demo/narration/<id>-<voz>.mp3
//
//   npm run demo:voice                 genera lo que falte
//   npm run demo:voice -- --force      regenera todo
//   npm run demo:voice -- --only quote regenera solo esa escena
//   npm run demo:voice -- --dry-run    lista los archivos esperados, sin llamar a la API
//
// Variables de entorno (la llave NUNCA se imprime ni se guarda; .env esta ignorado por git):
//   ELEVENLABS_API_KEY          llave de la API
//   ELEVENLABS_VOICE_ID_MUJER   id de una voz femenina en espanol mexicano
//   ELEVENLABS_VOICE_ID_HOMBRE  id de una voz masculina en espanol mexicano
//   ELEVENLABS_MODEL_ID         opcional; por defecto el de narration.json (modelo multilingue)
// La demo reproduce los MP3 locales: no llama a ElevenLabs desde el navegador.

import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(ROOT, "public", "demo", "narration");
const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const only = args.includes("--only") ? args[args.indexOf("--only") + 1] : null;

const narration = JSON.parse(await readFile(path.join(ROOT, "src", "demo", "narration.json"), "utf8"));
const jobs = narration.scenes
  .filter((s) => !only || s.id === only)
  .flatMap((s) => s.voice.map((voice) => ({ id: s.id, voice, text: s.text, file: `${s.id}-${voice}.mp3` })));

if (jobs.length === 0) {
  console.error(`No hay escenas que coincidan con --only ${only}.`);
  process.exit(1);
}

const exists = async (p) => {
  try {
    return (await stat(p)).size > 0;
  } catch {
    return false;
  }
};

if (flag("--dry-run")) {
  for (const j of jobs) {
    const state = (await exists(path.join(OUT_DIR, j.file))) ? "existe " : "FALTA  ";
    console.log(`${state} ${j.file}  (${j.text.split(/\s+/).length} palabras)`);
  }
  process.exit(0);
}

const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
if (!apiKey) {
  console.error("Falta ELEVENLABS_API_KEY en el entorno (o en .env local). No se genero nada.");
  process.exit(1);
}
const voiceIds = {};
for (const [voice, cfg] of Object.entries(narration.voices)) {
  const id = process.env[cfg.voiceIdEnv]?.trim();
  if (!id) {
    console.error(`Falta ${cfg.voiceIdEnv} (id de voz ElevenLabs para "${voice}"). No se genero nada.`);
    process.exit(1);
  }
  if (!/^[A-Za-z0-9]{10,40}$/.test(id)) {
    console.error(`${cfg.voiceIdEnv} no parece un id de voz valido.`);
    process.exit(1);
  }
  voiceIds[voice] = id;
}
const model = process.env.ELEVENLABS_MODEL_ID?.trim() || narration.defaultModel;

await mkdir(OUT_DIR, { recursive: true });
let failed = 0;
for (const j of jobs) {
  const target = path.join(OUT_DIR, j.file);
  if (!flag("--force") && (await exists(target))) {
    console.log(`= ${j.file} (ya existe, se omite)`);
    continue;
  }
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceIds[j.voice]}?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { "xi-api-key": apiKey, "Content-Type": "application/json", Accept: "audio/mpeg" },
    body: JSON.stringify({
      text: j.text,
      model_id: model,
      voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.1, use_speaker_boost: true }
    })
  });
  if (!res.ok) {
    failed += 1;
    // Solo el codigo HTTP: el cuerpo de error podria reflejar datos de la cuenta.
    console.error(`x ${j.file}: HTTP ${res.status}`);
    continue;
  }
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(target, buf);
  console.log(`+ ${j.file} (${(buf.length / 1024).toFixed(0)} KB)`);
}
if (failed) {
  console.error(`${failed} archivo(s) fallaron.`);
  process.exit(1);
}
console.log("Listo. Verifica duraciones con: ffprobe -show_entries format=duration -of csv=p=0 <archivo>");
