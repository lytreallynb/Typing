"use client";

import type { UserProgress } from "@/types/lesson";

interface ProgressOverviewProps {
  data: UserProgress | null;
  loading?: boolean;
  error?: string | null;
}

export default function ProgressOverview({ data, loading, error }: ProgressOverviewProps) {
  if (error) {
    return (
      <div className="rounded-3xl border border-red-100 dark:border-red-900 bg-red-50 dark:bg-red-900/20 px-6 py-4 text-sm text-red-600 dark:text-red-400">
        {error}
      </div>
    );
  }

  if (!data && loading) {
    return (
      <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
        Loading progress…
      </div>
    );
  }

  if (!data || !data.overall) {
    return (
      <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
        Start typing to see your progress history.
      </div>
    );
  }

  const { overall, per_pack: perPack, streak } = data;

  return (
    <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 px-6 py-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          Learning Progress
        </h3>
        {loading && <span className="text-xs text-gray-400 dark:text-gray-500">Refreshing…</span>}
      </div>

      {streak && streak.current_streak > 0 && (
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200 dark:border-orange-800 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🔥</div>
            <div>
              <div className="text-sm font-semibold text-orange-900 dark:text-orange-200">
                {streak.current_streak} Day Streak
              </div>
              <div className="text-xs text-orange-600 dark:text-orange-400">
                Longest: {streak.longest_streak} days
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div>
          <div className="text-xs text-gray-400 dark:text-gray-500 uppercase">Attempts</div>
          <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{overall.attempts}</div>
        </div>
        <div>
          <div className="text-xs text-gray-400 dark:text-gray-500 uppercase">Avg WPM</div>
          <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {overall.wpm.toFixed(1)}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-400 dark:text-gray-500 uppercase">Avg CPM</div>
          <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {(overall.cpm ?? 0).toFixed(1)}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-400 dark:text-gray-500 uppercase">Avg CER</div>
          <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {(overall.cer * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      {perPack.length > 0 && (
        <div className="space-y-3">
          {perPack.map((pack) => (
            <div
              key={pack.pack_id}
              className="rounded-2xl border border-gray-100 dark:border-gray-700 px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between"
            >
              <div>
                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {pack.pack_id}
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-500">
                  Attempts: {pack.attempts}
                </div>
              </div>
              <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-300 mt-3 md:mt-0">
                <span>WPM {pack.wpm.toFixed(1)}</span>
                <span>CPM {(pack.cpm ?? 0).toFixed(1)}</span>
                <span>CER {(pack.cer * 100).toFixed(1)}%</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
