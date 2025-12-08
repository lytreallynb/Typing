import type { PracticeItem } from "@/types/practice";
import { motion } from "framer-motion";

interface SentenceCardProps {
  item: PracticeItem | null;
  revealTranslation: boolean;
}

export function SentenceCard({ item, revealTranslation }: SentenceCardProps) {
  if (!item) return null;
  return (
    <motion.div initial={{ opacity: 0.5, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Sentence Context</div>
      <p className="mt-3 text-lg font-semibold text-gray-900 dark:text-gray-50">{item.sample_sentence}</p>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: revealTranslation ? 1 : 0.2, y: revealTranslation ? 0 : 10 }}
        className="mt-3 text-sm text-gray-500 dark:text-gray-300"
      >
        {revealTranslation ? item.sentence_translation : "完成句子后自动显示中文含义"}
      </motion.p>
    </motion.div>
  );
}
