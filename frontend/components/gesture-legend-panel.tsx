import { GESTURE_LEGEND } from "@/lib/gesture-mapper";
import type { RecognizedGesture } from "@/lib/types";

type GestureLegendPanelProps = {
  activeGesture: RecognizedGesture | null;
};

function isLegendItemActive(
  labels: string[],
  token: string,
  activeGesture: RecognizedGesture | null,
) {
  if (!activeGesture) {
    return false;
  }

  return labels.includes(activeGesture.label) || activeGesture.token === token;
}

function getHandLabel(hand: "Left" | "Right" | "Custom") {
  switch (hand) {
    case "Left":
      return "Tangan kiri";
    case "Right":
      return "Tangan kanan";
    default:
      return "Custom model";
  }
}

export function GestureLegendPanel({ activeGesture }: GestureLegendPanelProps) {
  const readyItems = GESTURE_LEGEND.filter(
    (item) => item.readiness === "ready",
  );
  const customItems = GESTURE_LEGEND.filter(
    (item) => item.readiness === "custom-model",
  );
  const activeLegendItem = activeGesture
    ? GESTURE_LEGEND.find(
        (item) =>
          item.labels.includes(activeGesture.label) ||
          item.token === activeGesture.token,
      )
    : null;

  return (
    <section className="glass-panel rounded-[32px] p-5 md:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-theme-muted text-xs font-semibold uppercase tracking-[0.25em]">
            Gesture Library
          </p>
          <h2 className="text-theme-strong mt-2 text-2xl font-bold">
            Mapping gesture yang tampil di UI
          </h2>
          <p className="text-theme-body mt-2 max-w-2xl text-sm leading-6">
            Setiap kartu menjelaskan pose tangan yang dibaca, label yang
            dikenali sistem, dan token yang akan masuk ke kalkulator.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white/85 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900/75">
          <p className="text-theme-body">
            Gesture aktif:
            <span className="text-theme-strong ml-2 font-semibold">
              {activeLegendItem
                ? `${activeLegendItem.title} (${activeLegendItem.token})`
                : "belum ada"}
            </span>
          </p>
          <p className="text-theme-muted mt-2 text-xs">
            {activeGesture
              ? `Label sistem: ${activeGesture.label} · Tangan: ${activeGesture.handedness}`
              : "Arahkan tangan ke kamera untuk melihat gesture yang sedang terbaca."}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-theme-strong text-lg font-bold">
            Siap dipakai sekarang
          </h3>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
            Default MediaPipe + heuristic
          </span>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {readyItems.map((item) => {
            const isActive = isLegendItemActive(
              item.labels,
              item.token,
              activeGesture,
            );

            return (
              <article
                key={item.id}
                className={`rounded-3xl border p-4 transition ${
                  isActive
                    ? "shadow-soft border-emerald-400 bg-emerald-50 dark:border-emerald-400 dark:bg-emerald-500/10"
                    : "border-slate-200 bg-white/85 dark:border-slate-700 dark:bg-slate-900/70"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-theme-muted text-xs font-semibold uppercase tracking-[0.2em]">
                      {getHandLabel(item.hand)}
                    </p>
                    <h4 className="text-theme-strong mt-2 text-lg font-bold">
                      {item.title}
                    </h4>
                  </div>
                  <span className="rounded-2xl bg-slate-950 px-3 py-2 text-xl font-black text-white dark:bg-slate-100 dark:text-slate-950">
                    {item.token}
                  </span>
                </div>

                <p className="text-theme-muted-strong mt-4 text-sm font-medium">
                  {item.detection}
                </p>
                <div className="mt-3 grid gap-2">
                  <div className="rounded-2xl bg-white/65 px-3 py-2 dark:bg-slate-950/35">
                    <p className="text-theme-muted text-[11px] font-semibold uppercase tracking-[0.18em]">
                      Label Sistem
                    </p>
                    <p className="text-theme-strong mt-1 text-sm font-semibold">
                      {item.systemLabel}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white/65 px-3 py-2 dark:bg-slate-950/35">
                    <p className="text-theme-muted text-[11px] font-semibold uppercase tracking-[0.18em]">
                      Sumber Deteksi
                    </p>
                    <p className="text-theme-strong mt-1 text-sm font-semibold">
                      {item.source}
                    </p>
                  </div>
                </div>
                <p className="text-theme-muted mt-3 text-sm leading-6">
                  {item.note}
                </p>
              </article>
            );
          })}
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-theme-strong text-lg font-bold">
            Butuh custom gesture model
          </h3>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
            Upgrade berikutnya
          </span>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {customItems.map((item) => (
            <article
              key={item.id}
              className="rounded-3xl border border-dashed border-slate-300 bg-white/65 p-4 dark:border-slate-700 dark:bg-slate-900/45"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-theme-muted text-xs font-semibold uppercase tracking-[0.2em]">
                    {getHandLabel(item.hand)}
                  </p>
                  <h4 className="text-theme-strong mt-2 text-lg font-bold">
                    {item.title}
                  </h4>
                </div>
                <span className="rounded-2xl border border-slate-300 px-3 py-2 text-xl font-black text-slate-700 dark:border-slate-600 dark:text-slate-100">
                  {item.token}
                </span>
              </div>

              <p className="text-theme-muted-strong mt-4 text-sm font-medium">
                {item.detection}
              </p>
              <div className="mt-3 grid gap-2">
                <div className="rounded-2xl bg-white/65 px-3 py-2 dark:bg-slate-950/35">
                  <p className="text-theme-muted text-[11px] font-semibold uppercase tracking-[0.18em]">
                    Label Sistem
                  </p>
                  <p className="text-theme-strong mt-1 text-sm font-semibold">
                    {item.systemLabel}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/65 px-3 py-2 dark:bg-slate-950/35">
                  <p className="text-theme-muted text-[11px] font-semibold uppercase tracking-[0.18em]">
                    Sumber Deteksi
                  </p>
                  <p className="text-theme-strong mt-1 text-sm font-semibold">
                    {item.source}
                  </p>
                </div>
              </div>
              <p className="text-theme-muted mt-3 text-sm leading-6">
                {item.note}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
