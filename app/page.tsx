/* eslint-disable react/no-unescaped-entities */
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LayoutWrapper } from "@/components/LayoutWrapper";
import { DifficultySelector } from "@/components/DifficultySelector";
import { ModeSelector } from "@/components/ModeSelector";
import { TypingBox } from "@/components/TypingBox";
import { StatsPanel } from "@/components/StatsPanel";
import { WordCard } from "@/components/WordCard";
import { SentenceCard } from "@/components/SentenceCard";
import { SettingsPanel } from "@/components/SettingsPanel";
import { usePracticeSession } from "@/hooks/usePracticeSession";
import { useSettingsStore } from "@/hooks/useSettingsStore";
import { usePracticeStore } from "@/hooks/usePracticeStore";
import type { PracticeItem, TypingStats } from "@/types/practice";
import { AddToCollectionButton } from "@/components/AddToCollectionButton";
import { UserMenu } from "@/components/UserMenu";
import Link from "next/link";

const INITIAL_STATS: TypingStats = {
  wpm: 0,
  accuracy: 100,
  elapsedMs: 0,
  errors: 0,
};

export default function Home() {
  const { currentItem, nextItem, progress, sessionSummary, advance, loading, mode } = usePracticeSession();
  const { difficulty } = usePracticeStore();
  const [stats, setStats] = useState<TypingStats>(INITIAL_STATS);
  const [revealedSentenceId, setRevealedSentenceId] = useState<string | null>(null);
  const showTranslation = useSettingsStore((state) => state.showTranslation);

  useEffect(() => {
    if (!currentItem) {
      setRevealedSentenceId(null);
      return;
    }
    if (currentItem.id !== revealedSentenceId) {
      setRevealedSentenceId(null);
    }
  }, [currentItem, revealedSentenceId]);

  const handleComplete = (result: { stats: TypingStats; wasPerfect: boolean; item: PracticeItem | null }) => {
    setStats(result.stats);
    if (mode === "sentence" && currentItem?.id) {
      setRevealedSentenceId(currentItem.id);
    }
    if (result.item?.collectionId) {
      void fetch(`/api/collection/${result.item.collectionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wasCorrect: result.wasPerfect }),
      });
    }
    void fetch("/api/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: result.item?.mode ?? mode,
        difficulty: result.item?.difficulty ?? difficulty,
        itemsAttempted: (result.item?.word?.length ?? 0) + (result.item?.sample_sentence?.length ?? 0),
        wpm: result.stats.wpm,
        accuracy: result.stats.accuracy,
        durationMs: result.stats.elapsedMs,
        metadata: {
          word: result.item?.word,
        },
      }),
    });
    setTimeout(() => {
      advance();
    }, 800);
  };

  return (
    <LayoutWrapper>
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gray-400">LinguaType</p>
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-50">English typing for Mandarin creators</h1>
          <p className="text-sm text-gray-500">Reinforce vocabulary and sentences with live stats and precision feedback.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden text-sm text-gray-500 sm:flex sm:gap-3">
            <Link href="/collection" className="text-indigo-600">
              Collection
            </Link>
            <Link href="/history" className="text-indigo-600">
              History
            </Link>
            <Link href="/settings/background" className="text-indigo-600">
              Background
            </Link>
          </div>
          {currentItem && (
            <div className="rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-600 dark:border-gray-800 dark:text-gray-300">
              Next: {nextItem?.word ?? "—"}
            </div>
          )}
          <SettingsPanel />
          <UserMenu />
        </div>
      </header>

      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="grid gap-6">
        <DifficultySelector />
        <ModeSelector />
      </motion.section>

      {loading && (
        <div className="rounded-3xl border border-dashed border-gray-300 bg-white/70 p-10 text-center text-gray-500 dark:border-gray-700 dark:bg-gray-900/50">
          Preparing new practice items…
        </div>
      )}

      {!loading && !currentItem && (
        <div className="rounded-3xl border border-dashed border-gray-200 bg-white/70 p-10 text-center text-gray-500 dark:border-gray-700 dark:bg-gray-900/50">
          Session complete 🎉 — refresh settings to start another round.
        </div>
      )}

      {currentItem && <TypingBox item={currentItem} mode={mode} onComplete={handleComplete} onStatsChange={setStats} />}
      <div className="flex justify-end">
        <AddToCollectionButton item={currentItem} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {mode === "word" ? (
          <WordCard item={currentItem} showTranslation={showTranslation} />
        ) : (
          <SentenceCard item={currentItem} revealTranslation={Boolean(showTranslation && currentItem && currentItem.id === revealedSentenceId)} />
        )}
        <StatsPanel stats={stats} progress={progress} sessionSummary={sessionSummary} />
      </div>
    </LayoutWrapper>
  );
}
