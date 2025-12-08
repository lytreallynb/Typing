import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { PracticeItem, PracticeMode, TypingStats } from "@/types/practice";
import { useTypingEngine } from "@/hooks/useTypingEngine";
import { useSettingsStore } from "@/hooks/useSettingsStore";
import { playKeySound } from "@/lib/sound";
import { cn } from "@/lib/utils";

interface TypingBoxProps {
  item: PracticeItem | null;
  mode: PracticeMode;
  onComplete: (result: { stats: TypingStats; wasPerfect: boolean; item: PracticeItem | null }) => void;
  onStatsChange?: (stats: TypingStats) => void;
}

export function TypingBox({ item, mode, onComplete, onStatsChange }: TypingBoxProps) {
  const text = useMemo(() => {
    if (!item) return "";
    return mode === "word" ? item.word : item.sample_sentence;
  }, [item, mode]);

  const translation = mode === "word" ? item?.translation : item?.sentence_translation;

  const { showTranslation, showCaret, soundOnKeypress, typography } = useSettingsStore();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isComposing, setIsComposing] = useState(false);

  const { characters, currentIndex, stats, isComplete, handleCharacter, handleBackspace, mistakes } = useTypingEngine(text, {
    onComplete: (nextStats) => {
      onComplete({
        stats: nextStats,
        wasPerfect: mistakes.length === 0,
        item,
      });
    },
    playSound: soundOnKeypress ? playKeySound : undefined,
  });

  useEffect(() => {
    onStatsChange?.(stats);
  }, [stats, onStatsChange]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [text]);

  const caretVisible = showCaret && !isComplete;
  const shouldShowTranslation = showTranslation && (mode === "word" || isComplete);

  const handleInput = (event: React.FormEvent<HTMLTextAreaElement>) => {
    const value = event.currentTarget.value;
    if (!value) return;
    for (const char of value) {
      handleCharacter(char);
    }
    event.currentTarget.value = "";
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Backspace") {
      event.preventDefault();
      handleBackspace();
    }
  };

  const handleCompositionEnd = (event: React.CompositionEvent<HTMLTextAreaElement>) => {
    setIsComposing(false);
    if (event.data) {
      for (const char of event.data) {
        handleCharacter(char);
      }
    }
  };

  if (!item) {
    return (
      <div className="rounded-3xl border border-dashed border-gray-300 bg-white/50 p-12 text-center text-gray-500 dark:border-gray-700 dark:bg-gray-900/60">
        Select a difficulty to begin practicing.
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-gray-200/70 bg-white/70 p-8 shadow-lg backdrop-blur dark:border-gray-800/70 dark:bg-gray-900/70">
      <div className="mb-6 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <div>
          <span className="font-semibold text-gray-900 dark:text-gray-50">{mode === "word" ? "Word Mode" : "Sentence Mode"}</span>
          <span className="ml-2 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">{item.difficulty}</span>
        </div>
        {shouldShowTranslation && <span>{translation}</span>}
      </div>

      <div
        ref={containerRef}
        onClick={() => inputRef.current?.focus()}
        className="relative min-h-[140px] cursor-text rounded-2xl border border-gray-100 bg-white/80 px-6 py-6 text-gray-900 shadow-inner dark:border-gray-800 dark:bg-gray-950/60"
        style={{
          fontFamily: '"JetBrains Mono", "Fira Code", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
          fontSize: typography.fontSize,
          lineHeight: `${typography.lineHeight}px`,
        }}
      >
        {characters.map((char, index) => {
          const isActive = index === currentIndex;
          return (
            <span
              key={`${char.char}-${index}`}
              className={cn(
                "relative transition-colors",
                char.status === "correct" && "text-gray-900 dark:text-gray-50",
                char.status === "pending" && "text-gray-400 dark:text-gray-500",
                char.status === "incorrect" && "text-red-500 dark:text-red-400"
              )}
            >
              {char.char === " " ? "\u00A0" : char.char}
              {caretVisible && isActive && <span className="caret-blink" />}
            </span>
          );
        })}
        {caretVisible && currentIndex === characters.length && <span className="caret-blink" />}
        <textarea
          ref={inputRef}
          className="sr-only"
          value=""
          aria-label="typing input"
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={handleCompositionEnd}
          readOnly={isComposing}
        />
      </div>

      {mode === "sentence" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: isComplete ? 1 : 0.3, y: isComplete ? 0 : 10 }} className="mt-6 text-sm text-gray-500 dark:text-gray-400">
          {isComplete ? translation : "完成输入后显示中文含义"}
        </motion.div>
      )}
    </div>
  );
}
