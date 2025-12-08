import { motion } from "framer-motion";
import { usePracticeStore } from "@/hooks/usePracticeStore";
import type { CEFRLevel } from "@/types/practice";
import { Button } from "@/components/ui/button";
import { LEVEL_LABELS } from "@/lib/utils";

const LEVELS: CEFRLevel[] = ["A1", "A2", "B1", "B2"];

export function DifficultySelector() {
  const { difficulty, setDifficulty } = usePracticeStore();

  return (
    <div className="rounded-3xl border border-gray-200/80 bg-white/60 p-6 shadow-sm backdrop-blur dark:border-gray-800/80 dark:bg-gray-900/60">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">Difficulty</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Choose the CEFR level you want to reinforce.</p>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {LEVELS.map((level) => {
          const active = level === difficulty;
          return (
            <motion.div key={level} whileHover={{ y: -2 }} className="rounded-2xl">
              <Button
                type="button"
                variant={active ? "default" : "outline"}
                className="h-auto w-full flex-col gap-1 rounded-2xl py-4"
                onClick={() => setDifficulty(level)}
              >
                <span className="text-lg font-semibold">{level}</span>
                <span className="text-xs text-gray-200 dark:text-gray-300">{LEVEL_LABELS[level]}</span>
              </Button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
