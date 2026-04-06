import type { RefObject } from "react";
import type { CameraOverlayBox, RecognizedGesture } from "@/lib/types";

function toOverlayStyle(box: CameraOverlayBox) {
  return {
    left: `${box.left * 100}%`,
    top: `${box.top * 100}%`,
    width: `${box.width * 100}%`,
    height: `${box.height * 100}%`,
  };
}

type CameraPanelProps = {
  videoRef: RefObject<HTMLVideoElement | null>;
  detectionGuideBox: CameraOverlayBox;
  handDetectionBox: CameraOverlayBox | null;
  isCameraActive: boolean;
  isRecognizerReady: boolean;
  activeGesture: RecognizedGesture | null;
  statusMessage: string;
  error: string | null;
  onStart: () => Promise<void>;
  onStop: () => void;
};

export function CameraPanel({
  videoRef,
  detectionGuideBox,
  handDetectionBox,
  isCameraActive,
  isRecognizerReady,
  activeGesture,
  statusMessage,
  error,
  onStart,
  onStop,
}: CameraPanelProps) {
  const guideBoxStyle = toOverlayStyle(detectionGuideBox);
  const handBoxStyle = handDetectionBox
    ? toOverlayStyle(handDetectionBox)
    : null;

  return (
    <section className="glass-panel surface-grid rounded-[32px] p-5 md:p-6">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-theme-muted text-xs font-semibold uppercase tracking-[0.25em]">
            Live Camera
          </p>
          <h2 className="text-theme-strong mt-2 text-2xl font-bold">
            Gesture capture
          </h2>
          <p className="text-theme-body mt-2 max-w-xl text-sm leading-6">
            Browser menangani vision loop secara real-time. Gesture yang stabil
            akan diubah menjadi token calculator. Posisikan tangan di frame
            hijau agar area deteksi lebih fokus dan detail.
          </p>
        </div>
        <div
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            isRecognizerReady
              ? "bg-emerald-100 text-emerald-700"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          {isRecognizerReady ? "Model Ready" : "Loading Model"}
        </div>
      </div>

      <div className="shadow-soft relative overflow-hidden rounded-[28px] border border-slate-200 bg-slate-950 dark:border-slate-700">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="aspect-video w-full object-cover"
        />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_42%,rgba(15,23,42,0.6)_100%)]" />
        <div className="pointer-events-none absolute inset-0">
          <div
            className={`absolute rounded-[32px] border transition-all duration-300 ${
              isCameraActive
                ? "border-emerald-300/70 bg-emerald-400/10"
                : "border-emerald-200/35 bg-emerald-300/5"
            }`}
            style={guideBoxStyle}
          >
            <div className="absolute left-3 top-3 h-6 w-6 rounded-tl-2xl border-l-2 border-t-2 border-emerald-300" />
            <div className="absolute right-3 top-3 h-6 w-6 rounded-tr-2xl border-r-2 border-t-2 border-emerald-300" />
            <div className="absolute bottom-3 left-3 h-6 w-6 rounded-bl-2xl border-b-2 border-l-2 border-emerald-300" />
            <div className="absolute bottom-3 right-3 h-6 w-6 rounded-br-2xl border-b-2 border-r-2 border-emerald-300" />
            <div className="absolute left-1/2 top-4 -translate-x-1/2 rounded-full bg-emerald-400/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-50/95 backdrop-blur-sm">
              Area Fokus
            </div>
            <div className="absolute inset-x-5 bottom-4 text-center text-[11px] font-medium leading-5 text-emerald-50/85">
              {isCameraActive
                ? "Taruh tangan di dalam frame hijau agar gesture lebih stabil."
                : "Frame hijau akan dipakai saat kamera aktif."}
            </div>
          </div>

          {handBoxStyle ? (
            <div
              className="absolute rounded-[28px] border-2 border-lime-300 bg-lime-400/12 shadow-[0_0_0_1px_rgba(190,242,100,0.4),0_0_24px_rgba(52,211,153,0.28)] transition-all duration-150 ease-out"
              style={handBoxStyle}
            >
              <div className="absolute -top-8 left-0 rounded-full bg-lime-300/95 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">
                Tangan Terdeteksi
              </div>
            </div>
          ) : null}
        </div>
        <div className="absolute left-4 top-4 rounded-full bg-white/85 px-3 py-1 text-xs font-semibold text-slate-900 dark:bg-slate-900/85 dark:text-slate-100">
          {isCameraActive ? "Camera Live" : "Camera Idle"}
        </div>

        <div className="bg-white/88 dark:bg-slate-950/78 absolute bottom-4 left-4 right-4 rounded-3xl p-4 text-slate-900 backdrop-blur dark:text-slate-100">
          <p className="text-theme-muted text-xs font-semibold uppercase tracking-[0.25em]">
            Active Gesture
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <span className="text-3xl font-black">
              {activeGesture?.token ?? "—"}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-200">
              {activeGesture?.label ?? "Belum ada gesture"}
            </span>
            {activeGesture ? (
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                {Math.round(activeGesture.confidence * 100)}% confidence
              </span>
            ) : null}
            {activeGesture?.handedness ? (
              <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700 dark:bg-sky-500/15 dark:text-sky-300">
                {activeGesture.handedness}
              </span>
            ) : null}
            {activeGesture?.source ? (
              <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
                {activeGesture.source}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => {
            void onStart();
          }}
          disabled={!isRecognizerReady || isCameraActive}
          className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-200 dark:disabled:bg-slate-700 dark:disabled:text-slate-300"
        >
          Start Camera
        </button>
        <button
          type="button"
          onClick={onStop}
          disabled={!isCameraActive}
          className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900/75 dark:text-slate-100 dark:hover:border-slate-500 dark:hover:bg-slate-900"
        >
          Stop Camera
        </button>
      </div>

      <div className="mt-4 rounded-3xl border border-slate-200 bg-white/80 p-4 dark:border-slate-700 dark:bg-slate-900/70">
        <p className="text-theme-body text-sm font-medium">
          {statusMessage}
        </p>
        {error ? (
          <p className="mt-2 text-sm font-medium text-orange-600">{error}</p>
        ) : null}
      </div>
    </section>
  );
}
