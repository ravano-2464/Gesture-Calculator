"use client";

import { useEffect, useState } from "react";
import { CameraPanel } from "@/components/camera-panel";
import { ExpressionPanel } from "@/components/expression-panel";
import { GestureLegendPanel } from "@/components/gesture-legend-panel";
import { HistoryPanel } from "@/components/history-panel";
import { useGestureCalculator } from "@/hooks/use-gesture-calculator";
import { GESTURE_MAPPING_GUIDE } from "@/lib/gesture-mapper";

type ThemeMode = "light" | "dark";

const THEME_STORAGE_KEY = "gesture-calculator-theme";

export function CalculatorDashboard() {
  const {
    videoRef,
    expression,
    result,
    history,
    activeGesture,
    detectionGuideBox,
    handDetectionBox,
    isRecognizerReady,
    isCameraActive,
    isSavingHistory,
    statusMessage,
    error,
    storageMode,
    lastCommittedToken,
    startCamera,
    stopCamera,
    clearExpression,
    backspaceExpression,
    pushManualToken,
  } = useGestureCalculator();
  const [themeMode, setThemeMode] = useState<ThemeMode>("light");
  const [hasResolvedTheme, setHasResolvedTheme] = useState(false);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem(
      THEME_STORAGE_KEY,
    ) as ThemeMode | null;
    const preferredTheme =
      savedTheme ??
      (window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light");

    setThemeMode(preferredTheme);
    setHasResolvedTheme(true);
  }, []);

  useEffect(() => {
    if (!hasResolvedTheme) {
      return;
    }

    document.documentElement.classList.toggle("dark", themeMode === "dark");
    window.localStorage.setItem(THEME_STORAGE_KEY, themeMode);
  }, [hasResolvedTheme, themeMode]);

  const isDarkMode = themeMode === "dark";

  return (
    <main className="min-h-screen px-4 py-8 md:px-6 md:py-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="text-theme-muted shadow-soft inline-flex rounded-full border border-white/70 bg-white/75 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] dark:border-slate-700 dark:bg-slate-900/75">
              Gesture Math Resolver MVP
            </div>
            <h1 className="text-theme-strong mt-5 max-w-4xl text-4xl font-black leading-tight md:text-6xl">
              Kalkulator gesture yang membaca tangan user lalu langsung
              membangun ekspresi matematika.
            </h1>
            <p className="text-theme-body mt-4 max-w-3xl text-base leading-7 md:text-lg">
              Frontend memproses kamera di browser dengan MediaPipe, lalu
              backend FastAPI menyimpan history agar MVP ini siap naik ke
              PostgreSQL atau Supabase saat masuk fase production.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setThemeMode((currentTheme) =>
                currentTheme === "dark" ? "light" : "dark",
              );
            }}
            className="text-theme-body shadow-soft inline-flex items-center gap-3 self-start rounded-full border border-slate-200 bg-white/85 px-4 py-3 text-sm font-semibold transition hover:-translate-y-0.5 dark:border-slate-700 dark:bg-slate-900/80"
          >
            <span className="rounded-full bg-slate-950 px-3 py-1 text-xs uppercase tracking-[0.18em] text-white dark:bg-slate-100 dark:text-slate-950">
              {isDarkMode ? "Dark" : "Light"}
            </span>
            <span>
              {isDarkMode ? "Pindah ke light mode" : "Pindah ke dark mode"}
            </span>
          </button>
        </header>

        <section className="glass-panel mb-6 rounded-[32px] p-5 md:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-theme-muted text-xs font-semibold uppercase tracking-[0.25em]">
                Mapping Notes
              </p>
              <h2 className="text-theme-strong mt-2 text-2xl font-bold">
                Gesture roadmap
              </h2>
            </div>
            <div className="text-theme-body rounded-3xl bg-white/85 px-4 py-3 text-sm dark:bg-slate-900/75">
              Model status:{" "}
              <span className="text-theme-strong font-semibold">
                {isRecognizerReady ? "ready" : "loading"}
              </span>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {GESTURE_MAPPING_GUIDE.map((hint) => (
              <div
                key={hint}
                className="text-theme-body rounded-3xl border border-slate-200 bg-white/80 p-4 text-sm leading-6 dark:border-slate-700 dark:bg-slate-900/70"
              >
                {hint}
              </div>
            ))}
          </div>
        </section>

        <div className="mb-6">
          <GestureLegendPanel activeGesture={activeGesture} />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.35fr,1fr]">
          <CameraPanel
            videoRef={videoRef}
            detectionGuideBox={detectionGuideBox}
            handDetectionBox={handDetectionBox}
            isCameraActive={isCameraActive}
            isRecognizerReady={isRecognizerReady}
            activeGesture={activeGesture}
            statusMessage={statusMessage}
            error={error}
            onStart={startCamera}
            onStop={stopCamera}
          />

          <div className="space-y-6">
            <ExpressionPanel
              expression={expression}
              result={result}
              activeGesture={activeGesture}
              lastCommittedToken={lastCommittedToken}
              isSavingHistory={isSavingHistory}
              onClear={clearExpression}
              onBackspace={backspaceExpression}
              onManualToken={pushManualToken}
            />
            <HistoryPanel history={history} storageMode={storageMode} />
          </div>
        </div>
      </div>
    </main>
  );
}
