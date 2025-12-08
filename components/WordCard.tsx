import type { PracticeItem } from "@/types/practice";
import { motion } from "framer-motion";

interface WordCardProps {
  item: PracticeItem | null;
  showTranslation: boolean;
}

export function WordCard({ item, showTranslation }: WordCardProps) {
  if (!item) return null;
  return (
    <motion.div initial={{ opacity: 0.5, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Word Focus</div>
      <div className="mt-2 text-3xl font-semibold text-gray-900 dark:text-gray-50">{item.word}</div>
      {showTranslation && <div className="mt-1 text-lg text-gray-500 dark:text-gray-300">{item.translation}</div>}
      <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">{item.sample_sentence}</p>
      {showTranslation && <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">{item.sentence_translation}</p>}
    </motion.div>
  );
}
