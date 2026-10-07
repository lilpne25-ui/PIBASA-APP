"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type ComponentType, type KeyboardEvent } from "react";
import type { DemoData } from "@/application/demo/load-demo-data";
import { VluxMark } from "@/components/vlux-mark";
import { audioPath, focusAt, readingMs, scenes, stepAt, voiceLabels, type DemoVoice, type SceneView } from "@/demo/scenes";
import { PibasaWordmark } from "./pibasa-wordmark";
import { CatalogStage } from "./stage-catalog";
import { CloseStage, ScopeStage, WelcomeStage } from "./stage-misc";
import { OwnerStage, PanelStage, TodayStage } from "./stage-ops";
import type { StageProps } from "./stage-parts";
import { FolioStage, QuoteStage } from "./stage-quote";
import { RoiStage } from "./stage-roi";

const stages: Record<SceneView, ComponentType<StageProps>> = {
  welcome: WelcomeStage,
  today: TodayStage,
  catalog: CatalogStage,
  quote: QuoteStage,
  folio: FolioStage,
  panel: PanelStage,
  owner: OwnerStage,
  scope: ScopeStage,
  roi: RoiStage,
  close: CloseStage
};

const VOICE_KEY = "pibasaDemoVoice";
const RATES = [1, 1.25, 0.85] as const;
const ADVANCE_DELAY_MS = 900;

type AudioMode = "loading" | "audio" | "reading";

/** Parte la narracion en frases para los subtitulos (el avance se pondera por longitud). */
export function sentencesOf(text: string): string[] {
  return text.match(/[^.!?]+[.!?]*/g)?.map((s) => s.trim()).filter(Boolean) ?? [text];
}

export function sentenceIndexAt(sentences: string[], progress: number): number {
  const total = sentences.reduce((n, s) => n + s.length, 0) || 1;
  let acc = 0;
  for (let i = 0; i < sentences.length; i++) {
    acc += sentences[i]!.length;
    if (progress * total < acc) return i;
  }
  return sentences.length - 1;
}

export function DemoPlayer({ data, onClose }: { data: DemoData; onClose: () => void }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [voice, setVoice] = useState<DemoVoice>(() => {
    try {
      return localStorage.getItem(VOICE_KEY) === "hombre" ? "hombre" : "mujer";
    } catch {
      return "mujer";
    }
  });
  const [muted, setMuted] = useState(false);
  const [rateIdx, setRateIdx] = useState(0);
  const [captions, setCaptions] = useState(true);
  const [chaptersOpen, setChaptersOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [audioMode, setAudioMode] = useState<AudioMode>("loading");
  const [finished, setFinished] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const pauseBtnRef = useRef<HTMLButtonElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pausedRef = useRef(false);
  const rateRef = useRef<number>(RATES[0]);
  pausedRef.current = paused;
  rateRef.current = RATES[rateIdx] ?? 1;

  const scene = scenes[index]!;
  const step = stepAt(scene, progress);
  const sentences = useMemo(() => sentencesOf(scene.text), [scene.text]);
  const sentence = sentences[sentenceIndexAt(sentences, progress)] ?? scene.text;
  const Stage = stages[scene.view];

  /* Motor: audio MP3 local si existe; si no (o sin voz), temporizador de lectura. El avance 0-1 alimenta
     pasos, resaltado y subtitulos, asi que nunca se desfasan del audio. */
  useEffect(() => {
    let cancelled = false;
    let raf = 0;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    let elapsed = 0;
    let last = performance.now();
    let done = false;
    let scheduled = false;
    let usingAudio = false;
    const total = readingMs(scene);
    const isLast = index === scenes.length - 1;
    setProgress(0);
    setFinished(false);

    let audio: HTMLAudioElement | null = null;
    if (!muted) {
      usingAudio = true;
      setAudioMode("loading");
      audio = new Audio(audioPath(scene.id, voice));
      audio.preload = "auto";
      audio.playbackRate = rateRef.current;
      const fallbackToReading = () => {
        if (cancelled) return;
        usingAudio = false;
        audio = null;
        audioRef.current = null;
        setAudioMode("reading");
      };
      audio.addEventListener("error", fallbackToReading);
      audio.addEventListener("playing", () => !cancelled && setAudioMode("audio"));
      audio.addEventListener("ended", () => {
        if (cancelled) return;
        done = true;
        setProgress(1);
      });
      audioRef.current = audio;
      if (!pausedRef.current) audio.play().catch(fallbackToReading);
    } else {
      audioRef.current = null;
      setAudioMode("reading");
    }

    const loop = (now: number) => {
      if (cancelled) return;
      const dt = Math.min(now - last, 100);
      last = now;
      if (!pausedRef.current && !done) {
        if (usingAudio && audio) {
          if (Number.isFinite(audio.duration) && audio.duration > 0) setProgress(Math.min(1, audio.currentTime / audio.duration));
        } else if (!usingAudio) {
          elapsed += dt * rateRef.current;
          const p = Math.min(1, elapsed / total);
          setProgress(p);
          if (p >= 1) done = true;
        }
      }
      if (done && !scheduled && !pausedRef.current) {
        scheduled = true;
        timeout = setTimeout(() => {
          if (cancelled) return;
          if (pausedRef.current) {
            scheduled = false;
            return;
          }
          if (isLast) setFinished(true);
          else setIndex((i) => i + 1);
        }, ADVANCE_DELAY_MS);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      if (timeout) clearTimeout(timeout);
      if (audio) audio.pause();
      audioRef.current = null;
    };
  }, [index, voice, muted, scene]);

  /* Pausa / reanudacion y velocidad sobre el audio en curso. */
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    if (paused) a.pause();
    else if (!a.ended) a.play().catch(() => undefined);
  }, [paused]);
  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = RATES[rateIdx] ?? 1;
  }, [rateIdx]);

  /* Resaltado del elemento de la escena en el paso actual. */
  useEffect(() => {
    const root = stageRef.current;
    if (!root) return;
    root.querySelectorAll(".exp-focus").forEach((el) => el.classList.remove("exp-focus"));
    const name = focusAt(scene, step);
    if (!name) return;
    const el = root.querySelector<HTMLElement>(`[data-focus="${name}"]`);
    if (!el) return;
    el.classList.add("exp-focus");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" });
  }, [scene, step]);

  /* Bloqueo de scroll del fondo y foco inicial. */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    pauseBtnRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const onVisibility = () => document.hidden && setPaused(true);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const go = useCallback((n: number) => {
    setChaptersOpen(false);
    setIndex(Math.max(0, Math.min(scenes.length - 1, n)));
  }, []);
  const interact = useCallback(() => setPaused(true), []);

  const restart = () => {
    setPaused(false);
    setFinished(false);
    go(0);
  };

  const toggleVoice = () => {
    const next: DemoVoice = voice === "mujer" ? "hombre" : "mujer";
    setVoice(next);
    try {
      localStorage.setItem(VOICE_KEY, next);
    } catch {
      /* sin almacenamiento: no pasa nada */
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      if (chaptersOpen) setChaptersOpen(false);
      else onClose();
      return;
    }
    if (e.key === "Tab") {
      const els = [...(rootRef.current?.querySelectorAll<HTMLElement>("button:not(:disabled), input, a[href]") ?? [])].filter(
        (el) => el.getClientRects().length > 0
      );
      const first = els[0];
      const end = els[els.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        end?.focus();
      } else if (!e.shiftKey && document.activeElement === end) {
        e.preventDefault();
        first?.focus();
      }
      return;
    }
    const t = e.target as HTMLElement;
    if (t.matches("input, select, textarea")) return;
    if (e.key === "ArrowRight") go(index + 1);
    else if (e.key === "ArrowLeft") go(index - 1);
  };

  const overall = ((index + (finished ? 1 : progress)) / scenes.length) * 100;

  return (
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-label="Demo guiada de Pibasa"
      data-scene={scene.id}
      onKeyDown={onKeyDown}
      className="demo-overlay fixed inset-0 z-50 overflow-y-auto bg-ink-950"
    >
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 bg-[radial-gradient(900px_480px_at_85%_-10%,rgba(111,183,201,0.07),transparent_65%)]" />

      <header className="fixed inset-x-0 top-0 z-10 flex items-center justify-between gap-4 bg-gradient-to-b from-ink-950 via-ink-950/85 to-transparent px-5 py-4 md:px-9">
        <div className="flex items-center gap-4">
          <PibasaWordmark size="sm" />
          <span className="font-mono text-[10px] text-steel-500">x</span>
          <VluxMark height={26} />
        </div>
        <div className="flex items-center gap-3">
          <span className="chip chip-warn hidden md:inline-flex">Demostración · datos de ejemplo y simulación</span>
          <Link href="/catalogo" target="_blank" rel="noopener noreferrer" className="hidden text-sm text-steel-300 transition-colors hover:text-steel-100 sm:inline">
            Explorar catálogo real ↗
          </Link>
          <button type="button" onClick={onClose} aria-label="Salir de la demo" className="btn btn-ghost !min-h-11 !px-4 !py-2">
            Salir ✕
          </button>
        </div>
      </header>

      <main className="relative mx-auto flex min-h-dvh max-w-6xl flex-col items-center px-5 pb-52 pt-[74px] md:px-8">
        <div key={`head-${scene.id}`} className="rise-in mb-5 max-w-4xl text-center">
          <p className="eyebrow">{scene.label}</p>
          <h2 className="mt-2.5 text-2xl font-semibold leading-[1.1] tracking-tight md:text-4xl [text-wrap:balance]">{scene.title}</h2>
          <p className="mt-2.5 text-sm text-steel-300">{scene.takeaway}</p>
        </div>
        <div ref={stageRef} key={scene.id} className="rise-in my-auto w-full">
          <Stage step={step} data={data} onInteract={interact} />
        </div>
      </main>

      {captions && (
        <div
          className="pointer-events-none fixed bottom-[92px] left-1/2 z-20 flex w-max max-w-[min(780px,calc(100%-24px))] -translate-x-1/2 items-center gap-4 rounded-2xl border border-ink-600/70 bg-ink-900/90 px-5 py-3 shadow-[0_18px_40px_-20px_rgba(0,0,0,0.95)] backdrop-blur-xl"
          aria-live="off"
        >
          <span className={`flex h-5 shrink-0 items-center gap-[3px] ${audioMode === "audio" && !paused ? "demo-wave" : ""}`} aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <i key={i} className="w-[2px] rounded-full bg-signal/80" style={{ height: i % 2 ? 16 : 7 }} />
            ))}
          </span>
          <p className="text-center text-[15px] leading-snug text-steel-100">{sentence}</p>
          {!muted && audioMode === "reading" && <span className="chip chip-warn hidden shrink-0 sm:inline-flex">Audio pendiente · lectura</span>}
        </div>
      )}

      <div className="fixed bottom-4 left-1/2 z-30 w-max max-w-[calc(100%-16px)] -translate-x-1/2">
        {chaptersOpen && (
          <nav aria-label="Capítulos" className="panel absolute bottom-full left-0 mb-3 max-h-[60vh] w-72 overflow-y-auto p-2 backdrop-blur-xl">
            {scenes.map((s, i) => (
              <button
                key={s.id}
                type="button"
                aria-current={i === index ? "step" : undefined}
                onClick={() => go(i)}
                className={`flex w-full items-center gap-4 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                  i === index ? "bg-signal/10 text-steel-100" : "text-steel-300 hover:bg-ink-700/60"
                }`}
              >
                <span className="font-mono text-[11px] text-steel-500">{String(i + 1).padStart(2, "0")}</span>
                {s.chapter}
              </button>
            ))}
          </nav>
        )}
        <div className="relative flex items-center gap-1 overflow-hidden rounded-full border border-ink-600/80 bg-ink-900/90 px-2 py-1.5 shadow-[0_18px_44px_-18px_rgba(0,0,0,0.95)] backdrop-blur-xl sm:gap-2 sm:px-3">
          <span aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-ink-600/60">
            <span className="block h-full bg-signal/80 transition-[width] duration-300" style={{ width: `${overall}%` }} />
          </span>
          <button
            type="button"
            onClick={() => setChaptersOpen((o) => !o)}
            aria-expanded={chaptersOpen}
            className="demo-pill-btn gap-2 px-3 font-mono text-xs text-steel-300"
          >
            <span>
              {String(index + 1).padStart(2, "0")}/{String(scenes.length).padStart(2, "0")}
            </span>
            <span className="hidden max-w-28 truncate font-sans text-sm text-steel-100 sm:inline">{scene.chapter}</span>
            <span aria-hidden="true">⌃</span>
          </button>
          <span className="mx-1 hidden h-6 w-px bg-ink-600 sm:block" />
          <button type="button" aria-label="Escena anterior" disabled={index === 0} onClick={() => go(index - 1)} className="demo-pill-btn">
            ‹
          </button>
          {finished ? (
            <button ref={pauseBtnRef} type="button" aria-label="Volver a comenzar" onClick={restart} className="demo-pill-btn">
              ↺
            </button>
          ) : (
            <button
              ref={pauseBtnRef}
              type="button"
              aria-label={paused ? "Reanudar narración" : "Pausar narración"}
              onClick={() => setPaused((p) => !p)}
              className="demo-pill-btn"
            >
              {paused ? "▶" : "Ⅱ"}
            </button>
          )}
          <button
            type="button"
            aria-label={index === scenes.length - 1 ? "Finalizar recorrido" : "Escena siguiente"}
            onClick={() => (index === scenes.length - 1 ? onClose() : go(index + 1))}
            className="demo-pill-btn"
          >
            {index === scenes.length - 1 ? "✓" : "›"}
          </button>
          <span className="mx-1 hidden h-6 w-px bg-ink-600 sm:block" />
          <button
            type="button"
            aria-pressed={!muted}
            aria-label={muted ? "Activar voz" : "Desactivar voz"}
            onClick={() => setMuted((m) => !m)}
            className="demo-pill-btn px-2 text-xs sm:px-3"
          >
            {muted ? "Sin voz" : "Voz"}
          </button>
          <button
            type="button"
            aria-label={`Cambiar voz. Actual: ${voiceLabels[voice]}`}
            onClick={toggleVoice}
            className="demo-pill-btn hidden px-3 text-xs sm:inline-flex"
          >
            {voice === "mujer" ? "Femenina" : "Masculina"}
          </button>
          <button
            type="button"
            aria-label={`Velocidad ${RATES[rateIdx]}x`}
            onClick={() => setRateIdx((r) => (r + 1) % RATES.length)}
            className="demo-pill-btn hidden px-2 font-mono text-xs sm:inline-flex"
          >
            {RATES[rateIdx]}×
          </button>
          <button
            type="button"
            aria-pressed={captions}
            aria-label={captions ? "Ocultar subtítulos" : "Mostrar subtítulos"}
            onClick={() => setCaptions((c) => !c)}
            className="demo-pill-btn px-2 font-mono text-xs"
          >
            CC
          </button>
        </div>
      </div>
      <span className="sr-only" role="status">
        Escena {index + 1} de {scenes.length}: {scene.title}. {muted ? "Voz desactivada." : audioMode === "reading" ? "Audio pendiente, modo lectura." : ""}
      </span>
    </div>
  );
}
