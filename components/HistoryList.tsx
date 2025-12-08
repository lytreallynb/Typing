"use client";

interface HistoryEntry {
  id: string;
  mode: string;
  difficulty: string;
  itemsAttempted: number;
  wpm: number;
  accuracy: number;
  durationMs: number;
  createdAt: string;
}

interface ProfileSnapshot {
  totalPracticeTime: number;
  totalWordsTyped: number;
  averageWPM: number;
  accuracyStats: number;
}

export function HistoryList({ histories, profile }: { histories: HistoryEntry[]; profile: ProfileSnapshot | null }) {
  return (
    <div className="space-y-6">
      {profile && (
        <div className="grid gap-4 sm:grid-cols-4">
          <StatCard label="Total Time" value={`${Math.round(profile.totalPracticeTime / 60000)} min`} />
          <StatCard label="Words Typed" value={profile.totalWordsTyped.toString()} />
          <StatCard label="Avg WPM" value={profile.averageWPM.toFixed(1)} />
          <StatCard label="Accuracy" value={`${profile.accuracyStats.toFixed(1)}%`} />
        </div>
      )}
      <div className="space-y-3">
        {histories.map((entry) => (
          <div key={entry.id} className="rounded-3xl border border-gray-200 bg-white/90 p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-50">
                  {entry.mode} · {entry.difficulty}
                </p>
                <p className="text-xs text-gray-500">{new Date(entry.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex gap-4 text-xs text-gray-500">
                <span>Items: {entry.itemsAttempted}</span>
                <span>WPM: {entry.wpm.toFixed(1)}</span>
                <span>Accuracy: {entry.accuracy.toFixed(1)}%</span>
                <span>Time: {(entry.durationMs / 1000).toFixed(1)}s</span>
              </div>
            </div>
          </div>
        ))}
        {histories.length === 0 && <p className="text-sm text-gray-500">No practice history yet.</p>}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white/80 p-4 text-center text-gray-900 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:text-gray-50">
      <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</div>
      <div className="mt-1 text-xl font-semibold">{value}</div>
    </div>
  );
}
