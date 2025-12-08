import { motion } from "framer-motion";
import type { TypingStats } from "@/types/practice";
import { cn } from "@/lib/utils";

interface StatsPanelProps {
  stats: TypingStats;
  progress: number;
  sessionSummary: {
    total: number;
    completed: number;
    remaining: number;
  };
}

const metricItems = [
  { id: "wpm", label: "WPM", format: (value: number) => value.toString() },
  { id: "accuracy", label: "Accuracy", format: (value: number) => `${value}%` },
  { id: "elapsed", label: "Time", format: (value: number) => `${(value / 1000).toFixed(1)}s` },
  { id: "errors", label: "Errors", format: (value: number) => value.toString() },
] as const;

export function StatsPanel({ stats, progress, sessionSummary }: StatsPanelProps) {
  return (
    <div className="rounded-3xl border border-gray-200/80 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-gray-800/80 dark:bg-gray-900/80">
      <div className="mb-4 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <span>Session progress</span>
        <span>
          {sessionSummary.completed}/{sessionSummary.total}
        </span>
      </div>
      <div className="mb-6 h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4 }}
          className="h-full rounded-full bg-indigo-500"
        />
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {metricItems.map((metric) => (
          <motion.div
            key={metric.id}
            initial={{ opacity: 0.5, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className={cn("rounded-2xl bg-gray-50/80 px-4 py-3 text-center dark:bg-gray-800/80")}
          >
            <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{metric.label}</div>
            <div className="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-50">
              {metric.id === "wpm" && metric.format(stats.wpm)}
              {metric.id === "accuracy" && metric.format(stats.accuracy)}
              {metric.id === "elapsed" && metric.format(stats.elapsedMs)}
              {metric.id === "errors" && metric.format(stats.errors)}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
