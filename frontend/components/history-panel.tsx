import type { HistoryEntry, StorageMode } from "@/lib/types";

type HistoryPanelProps = {
  history: HistoryEntry[];
  storageMode: StorageMode;
};

const formatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
});

function getStorageLabel(storageMode: StorageMode) {
  switch (storageMode) {
    case "database":
      return "PostgreSQL / Supabase connected";
    case "memory":
      return "Backend aktif, mode in-memory";
    default:
      return "Backend offline";
  }
}

export function HistoryPanel({ history, storageMode }: HistoryPanelProps) {
  return (
    <section className="glass-panel rounded-[32px] p-5 md:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-theme-muted text-xs font-semibold uppercase tracking-[0.25em]">
            Calculation History
          </p>
          <h2 className="text-theme-strong mt-2 text-2xl font-bold">
            Recent sessions
          </h2>
        </div>
        <div className="text-theme-body rounded-full bg-white px-3 py-1 text-xs font-semibold dark:bg-slate-900/75">
          {getStorageLabel(storageMode)}
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {history.length === 0 ? (
          <div className="text-theme-muted rounded-3xl border border-dashed border-slate-300 bg-white/70 p-6 text-sm dark:border-slate-700 dark:bg-slate-900/60">
            Belum ada history. Jalankan backend lalu hitung ekspresi untuk mulai
            menyimpan riwayat.
          </div>
        ) : (
          history.map((entry) => (
            <article
              key={entry.id}
              className="rounded-3xl border border-slate-200 bg-white/80 p-4 dark:border-slate-700 dark:bg-slate-900/70"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-theme-strong font-mono text-lg font-semibold">
                    {entry.expression} = {entry.result}
                  </p>
                  <p className="text-theme-muted mt-1 text-sm">
                    {formatter.format(new Date(entry.createdAt))}
                  </p>
                </div>
                {entry.sourceLabel ? (
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                    {entry.sourceLabel}
                  </span>
                ) : null}
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
