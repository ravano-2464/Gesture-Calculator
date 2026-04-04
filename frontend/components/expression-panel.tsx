import type { RecognizedGesture } from "@/lib/types";

type ExpressionPanelProps = {
  expression: string;
  result: string | null;
  activeGesture: RecognizedGesture | null;
  lastCommittedToken: string | null;
  isSavingHistory: boolean;
  onClear: () => void;
  onBackspace: () => void;
  onManualToken: (token: string) => void;
};

const MANUAL_PAD = [
  ["7", "8", "9", "/"],
  ["4", "5", "6", "*"],
  ["1", "2", "3", "-"],
  ["0", "=", "+", "C"],
];

export function ExpressionPanel({
  expression,
  result,
  activeGesture,
  lastCommittedToken,
  isSavingHistory,
  onClear,
  onBackspace,
  onManualToken,
}: ExpressionPanelProps) {
  return (
    <section className="glass-panel rounded-[32px] p-5 md:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-theme-muted text-xs font-semibold uppercase tracking-[0.25em]">
            Expression Builder
          </p>
          <h2 className="text-theme-strong mt-2 text-2xl font-bold">
            Token stream
          </h2>
        </div>
        <div className="text-theme-muted rounded-full bg-white px-3 py-1 text-xs font-semibold dark:bg-slate-900/75">
          {isSavingHistory ? "Saving history..." : "Realtime"}
        </div>
      </div>

      <div className="metric-card mt-5 rounded-[28px] p-5">
        <p className="text-theme-muted text-xs font-semibold uppercase tracking-[0.2em]">
          Current Expression
        </p>
        <div className="mt-4 min-h-14 rounded-2xl bg-slate-950 px-4 py-3 font-mono text-2xl text-white dark:bg-slate-100 dark:text-slate-950">
          {expression || "Mulai dari gesture angka di tangan kiri"}
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/80">
            <p className="text-theme-muted text-xs font-semibold uppercase tracking-[0.2em]">
              Result
            </p>
            <p className="mt-3 text-3xl font-black text-emerald-600">
              {result ?? "Belum ada hasil"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/80">
            <p className="text-theme-muted text-xs font-semibold uppercase tracking-[0.2em]">
              Last Accepted Token
            </p>
            <p className="mt-3 text-3xl font-black text-sky-700">
              {lastCommittedToken ?? "—"}
            </p>
            <p className="text-theme-muted mt-2 text-sm">
              Gesture aktif: {activeGesture?.label ?? "belum ada"}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onBackspace}
          className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900/75 dark:text-slate-100 dark:hover:border-slate-500"
        >
          Backspace
        </button>
        <button
          type="button"
          onClick={onClear}
          className="rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
        >
          Clear
        </button>
      </div>

      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-theme-strong text-lg font-bold">
            MVP Test Pad
          </h3>
          <p className="text-theme-muted text-sm">
            Untuk ngetes flow tanpa kamera
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-4">
          {MANUAL_PAD.flat().map((token) => (
            <button
              key={token}
              type="button"
              onClick={() => {
                if (token === "C") {
                  onClear();
                  return;
                }

                onManualToken(token);
              }}
              className={`shadow-soft rounded-2xl px-4 py-4 text-lg font-bold transition ${
                token === "="
                  ? "bg-emerald-500 text-white hover:bg-emerald-600"
                  : token === "C"
                    ? "bg-orange-100 text-orange-700 hover:bg-orange-200"
                    : "bg-white text-slate-900 hover:-translate-y-0.5 dark:bg-slate-900/80 dark:text-slate-100"
              }`}
            >
              {token}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
