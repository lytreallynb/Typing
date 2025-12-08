import { motion } from "framer-motion";
import { PenSquare, TextQuote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, PRACTICE_LENGTH_LABELS } from "@/lib/utils";
import type { PracticeLength, PracticeMode, SamplingStrategy } from "@/types/practice";
import { usePracticeStore } from "@/hooks/usePracticeStore";

const modeCards: { mode: PracticeMode; title: string; description: string; icon: React.ReactNode }[] = [
  {
    mode: "word",
    title: "Word Mode",
    description: "Focus on core vocabulary with quick targets.",
    icon: <PenSquare className="h-5 w-5" />,
  },
  {
    mode: "sentence",
    title: "Sentence Mode",
    description: "Reinforce context and natural phrasing.",
    icon: <TextQuote className="h-5 w-5" />,
  },
];

const samplingOptions: { value: SamplingStrategy; label: string; description: string }[] = [
  { value: "sequential", label: "Sequential", description: "Follow curated order" },
  { value: "random", label: "Random", description: "Shuffle for challenge" },
  { value: "difficulty", label: "By Difficulty", description: "Mix from easier to harder" },
];

export function ModeSelector() {
  const { mode, setMode, practiceLength, setPracticeLength, sampling, setSampling, reviewMode, toggleReviewMode } = usePracticeStore();

  return (
    <div className="rounded-3xl border border-gray-200/80 bg-white/60 p-6 shadow-sm backdrop-blur dark:border-gray-800/80 dark:bg-gray-900/60">
      <div className="grid gap-4 lg:grid-cols-3">
        {modeCards.map((card) => {
          const active = card.mode === mode;
          return (
            <motion.button
              key={card.mode}
              whileHover={{ scale: 1.01 }}
              onClick={() => setMode(card.mode)}
              className={cn(
                "rounded-2xl border p-4 text-left transition-colors",
                active ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10" : "border-transparent bg-gray-50 dark:bg-gray-800"
              )}
            >
              <div className="mb-3 flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                {card.icon}
                <span className="text-sm font-semibold uppercase">{card.title}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">{card.description}</p>
            </motion.button>
          );
        })}
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-50">Practice length</h4>
          <div className="mt-3 flex flex-wrap gap-2">
            {(Object.keys(PRACTICE_LENGTH_LABELS) as PracticeLength[]).map((length) => {
              const active = length === practiceLength;
              return (
                <Button key={length} variant={active ? "default" : "outline"} className="rounded-full" onClick={() => setPracticeLength(length)}>
                  {PRACTICE_LENGTH_LABELS[length]}
                </Button>
              );
            })}
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-50">Sampling strategy</h4>
          <div className="mt-3 grid gap-2">
            {samplingOptions.map((option) => {
              const active = option.value === sampling;
              return (
                <button
                  key={option.value}
                  onClick={() => setSampling(option.value)}
                  className={cn(
                    "rounded-2xl border px-4 py-3 text-left transition-colors",
                    active ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10" : "border-transparent bg-gray-50 dark:bg-gray-800"
                  )}
                >
                  <div className="text-sm font-semibold text-gray-900 dark:text-gray-50">{option.label}</div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{option.description}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div className="mt-6 rounded-2xl border border-dashed border-gray-300 p-4 dark:border-gray-700">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-50">Review mode</h4>
            <p className="text-xs text-gray-500">Mix in due collection items using SRS scheduling.</p>
          </div>
          <Button variant={reviewMode ? "default" : "outline"} className="rounded-full" onClick={toggleReviewMode}>
            {reviewMode ? "On" : "Off"}
          </Button>
        </div>
      </div>
    </div>
  );
}
