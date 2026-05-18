"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const DEFAULT_YARD_MINUTES = 60;
const DEFAULT_LAP_KM = 6.706;
const BEEP_MARKS_SEC = [180, 60, 30, 10];
const TICK_MS = 100;

interface RunState {
  startedAt: number;
  pausedAt: number | null;
  totalPausedMs: number;
}

function formatMMSS(ms: number): string {
  const totalSec = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function formatHHMMSS(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${h.toString().padStart(2, "0")}:${m
    .toString()
    .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

/**
 * BackyardChrono — large-screen countdown for a Backyard Ultra event.
 *
 * Computes elapsed time relative to a fixed start timestamp so a tab freeze
 * or background throttle cannot drift the clock — the displayed value is
 * always derived from Date.now() at render time.
 */
export function BackyardChrono(): React.ReactNode {
  const [run, setRun] = useState<RunState | null>(null);
  const [now, setNow] = useState<number>(() => Date.now());
  const [yardMinutes, setYardMinutes] = useState<number>(DEFAULT_YARD_MINUTES);
  const [lapKm, setLapKm] = useState<number>(DEFAULT_LAP_KM);
  const [muted, setMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const lastSecondRef = useRef<number | null>(null);
  const lastYardIndexRef = useRef<number | null>(null);

  const yardDurationMs = yardMinutes * 60 * 1000;
  const isRunning = run !== null && run.pausedAt === null;
  const isPaused = run !== null && run.pausedAt !== null;

  // Ticker — only runs while actively counting down
  useEffect(() => {
    if (!isRunning) return;
    const id = window.setInterval(() => setNow(Date.now()), TICK_MS);
    return () => window.clearInterval(id);
  }, [isRunning]);

  // Track fullscreen state so the toggle button stays in sync if the user
  // exits with Escape
  useEffect(() => {
    function onChange(): void {
      setIsFullscreen(Boolean(document.fullscreenElement));
    }
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const getAudioCtx = useCallback((): AudioContext | null => {
    if (typeof window === "undefined") return null;
    if (!audioCtxRef.current) {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctx) return null;
      audioCtxRef.current = new Ctx();
    }
    if (audioCtxRef.current.state === "suspended") {
      void audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  const playTone = useCallback(
    (
      freq: number,
      durationSec: number,
      offsetSec: number = 0,
      volume: number = 0.35
    ): void => {
      if (muted) return;
      const ctx = getAudioCtx();
      if (!ctx) return;
      const start = ctx.currentTime + offsetSec;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(volume, start + 0.015);
      gain.gain.linearRampToValueAtTime(0, start + durationSec);
      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + durationSec + 0.02);
    },
    [muted, getAudioCtx]
  );

  const playMarker = useCallback((): void => {
    playTone(880, 0.35, 0, 0.4);
  }, [playTone]);

  const playWhistle = useCallback((): void => {
    // 3 rising pips — a recognisable "start of yard" signal
    playTone(1200, 0.18, 0, 0.45);
    playTone(1200, 0.18, 0.22, 0.45);
    playTone(1700, 0.55, 0.44, 0.5);
  }, [playTone]);

  // Derived values
  let elapsedMs = 0;
  if (run) {
    const nowRef = run.pausedAt ?? now;
    elapsedMs = nowRef - run.startedAt - run.totalPausedMs;
    if (elapsedMs < 0) elapsedMs = 0;
  }
  const yardIndex = Math.floor(elapsedMs / yardDurationMs);
  const currentYardNumber = yardIndex + 1;
  const msIntoYard = elapsedMs % yardDurationMs;
  const msRemaining = yardDurationMs - msIntoYard;
  const secRemaining = Math.ceil(msRemaining / 1000);
  const yardsCompleted = yardIndex;
  const totalDistanceKm = yardsCompleted * lapKm;
  const dangerFlash = isRunning && secRemaining <= 30 && secRemaining > 0;

  // Side effects: beeps on marker seconds + whistle on yard transitions
  useEffect(() => {
    if (!isRunning) {
      lastSecondRef.current = null;
      return;
    }
    if (lastYardIndexRef.current === null) {
      lastYardIndexRef.current = yardIndex;
    } else if (yardIndex !== lastYardIndexRef.current) {
      lastYardIndexRef.current = yardIndex;
      playWhistle();
    }
    if (lastSecondRef.current !== secRemaining) {
      const prev = lastSecondRef.current;
      lastSecondRef.current = secRemaining;
      if (prev !== null && BEEP_MARKS_SEC.includes(secRemaining)) {
        playMarker();
      }
    }
  }, [isRunning, secRemaining, yardIndex, playMarker, playWhistle]);

  const handleStart = useCallback((): void => {
    // Prime audio context inside a user gesture so iOS/Safari permits playback
    getAudioCtx();
    const t = Date.now();
    lastSecondRef.current = null;
    lastYardIndexRef.current = 0;
    setRun({ startedAt: t, pausedAt: null, totalPausedMs: 0 });
    setNow(t);
    // Whistle to signal the very first yard start
    setTimeout(() => playWhistle(), 50);
  }, [getAudioCtx, playWhistle]);

  const handlePause = useCallback((): void => {
    setRun((prev) => {
      if (!prev || prev.pausedAt !== null) return prev;
      return { ...prev, pausedAt: Date.now() };
    });
  }, []);

  const handleResume = useCallback((): void => {
    setRun((prev) => {
      if (!prev || prev.pausedAt === null) return prev;
      const pauseDuration = Date.now() - prev.pausedAt;
      return {
        ...prev,
        pausedAt: null,
        totalPausedMs: prev.totalPausedMs + pauseDuration,
      };
    });
  }, []);

  const handleReset = useCallback((): void => {
    const ok = window.confirm(
      "Réinitialiser le chronomètre ? Toutes les données seront perdues."
    );
    if (!ok) return;
    setRun(null);
    lastSecondRef.current = null;
    lastYardIndexRef.current = null;
  }, []);

  const handleToggleFullscreen = useCallback(async (): Promise<void> => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await el.requestFullscreen();
    }
  }, []);

  const remainingDisplay = run ? formatMMSS(msRemaining) : formatMMSS(yardDurationMs);
  const totalDisplay = run ? formatHHMMSS(elapsedMs) : "00:00:00";

  return (
    <div
      ref={containerRef}
      className={`relative flex min-h-[calc(100vh-12rem)] w-full flex-col overflow-hidden bg-black text-white ${
        isFullscreen ? "h-screen min-h-screen" : ""
      }`}
    >
      {/* Background flash on final 30 seconds */}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 transition-opacity duration-200 ${
          dangerFlash ? "animate-pulse bg-red-700/40 opacity-100" : "opacity-0"
        }`}
      />

      {/* Top — yard number + total */}
      <div className="relative z-10 flex flex-wrap items-start justify-between gap-4 px-[3vw] pt-[3vh]">
        <div>
          <div className="text-[2.5vw] font-medium uppercase tracking-[0.3em] text-cyan-400">
            Yard
          </div>
          <div className="text-[10vw] font-black leading-none text-cyan-400 tabular-nums">
            {currentYardNumber.toString().padStart(2, "0")}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[1.6vw] font-medium uppercase tracking-[0.3em] text-white/60">
            Temps total
          </div>
          <div className="text-[5vw] font-bold leading-none text-white tabular-nums">
            {totalDisplay}
          </div>
          <div className="mt-[1vh] text-[1.6vw] font-medium uppercase tracking-[0.3em] text-white/60">
            Distance
          </div>
          <div className="text-[3.5vw] font-bold leading-none text-white tabular-nums">
            {totalDistanceKm.toFixed(2)}
            <span className="text-[2vw] text-white/60"> km</span>
          </div>
        </div>
      </div>

      {/* Center — countdown */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-[3vw]">
        <div className="text-[2vw] font-medium uppercase tracking-[0.5em] text-white/50">
          Temps restant
        </div>
        <div
          className={`select-none font-black leading-none tabular-nums ${
            dangerFlash ? "text-red-400" : "text-[#FF8C00]"
          }`}
          style={{
            fontSize: "min(34vw, 60vh)",
            textShadow: dangerFlash
              ? "0 0 60px rgba(248,113,113,0.6)"
              : "0 0 80px rgba(255,140,0,0.45)",
          }}
        >
          {remainingDisplay}
        </div>

        {!run && (
          <div className="mt-[3vh] text-[2vw] font-semibold uppercase tracking-[0.4em] text-white/60">
            Prêt — Appuyer sur Démarrer
          </div>
        )}
        {isPaused && (
          <div className="mt-[2vh] text-[2.5vw] font-bold uppercase tracking-[0.4em] text-yellow-400">
            ⏸ Pause
          </div>
        )}
      </div>

      {/* Bottom — branding + controls */}
      <div className="relative z-10 flex flex-wrap items-end justify-between gap-4 px-[3vw] pb-[3vh]">
        <div className="text-[2vw] font-black uppercase tracking-[0.3em] text-[#FF8C00]">
          LADTC
          <span className="ml-[1vw] text-white/40 text-[1.5vw] font-medium tracking-[0.2em]">
            Backyard Ultra
          </span>
        </div>

        <div className="flex flex-wrap items-end gap-2 print:hidden">
          {!run && (
            <Button
              size="lg"
              className="bg-[#FF8C00] text-black hover:bg-[#FF8C00]/90"
              onClick={handleStart}
            >
              ▶ Démarrer
            </Button>
          )}
          {isRunning && (
            <Button size="lg" variant="secondary" onClick={handlePause}>
              ⏸ Pause
            </Button>
          )}
          {isPaused && (
            <Button
              size="lg"
              className="bg-[#FF8C00] text-black hover:bg-[#FF8C00]/90"
              onClick={handleResume}
            >
              ▶ Reprendre
            </Button>
          )}
          {run && (
            <Button size="lg" variant="destructive" onClick={handleReset}>
              ↺ Reset
            </Button>
          )}
          <Button
            size="lg"
            variant="outline"
            className="border-white/30 bg-transparent text-white hover:bg-white/10"
            onClick={() => setMuted((m) => !m)}
          >
            {muted ? "🔇 Activer son" : "🔊 Son ON"}
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-white/30 bg-transparent text-white hover:bg-white/10"
            onClick={handleToggleFullscreen}
          >
            {isFullscreen ? "⤢ Quitter plein écran" : "⛶ Plein écran"}
          </Button>
        </div>
      </div>

      {/* Settings — only visible before run starts, and never in fullscreen */}
      {!run && !isFullscreen && (
        <div className="relative z-10 border-t border-white/10 bg-black/60 px-[3vw] py-4">
          <div className="flex flex-wrap items-end gap-6">
            <div>
              <Label
                htmlFor="yardMinutes"
                className="text-xs uppercase tracking-widest text-white/60"
              >
                Durée du tour (minutes)
              </Label>
              <Input
                id="yardMinutes"
                type="number"
                min={1}
                max={240}
                step={1}
                value={yardMinutes}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  if (Number.isFinite(v) && v > 0) setYardMinutes(v);
                }}
                className="mt-1 w-32 border-white/20 bg-black text-white"
              />
            </div>
            <div>
              <Label
                htmlFor="lapKm"
                className="text-xs uppercase tracking-widest text-white/60"
              >
                Distance d&apos;un tour (km)
              </Label>
              <Input
                id="lapKm"
                type="number"
                min={0.1}
                step={0.001}
                value={lapKm}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  if (Number.isFinite(v) && v > 0) setLapKm(v);
                }}
                className="mt-1 w-32 border-white/20 bg-black text-white"
              />
            </div>
            <p className="ml-auto max-w-md text-xs text-white/50">
              Standard Backyard Ultra : 60 min, 6,706 km par tour. Bips d&apos;alerte
              à 3 min, 1 min, 30 s, 10 s. Sifflet au départ de chaque yard.
              Flash rouge dans les 30 dernières secondes.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
