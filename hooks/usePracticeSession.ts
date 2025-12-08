import { useCallback, useEffect, useMemo, useState } from "react";
import { loadVocabulary } from "@/lib/vocabLoader";
import type { CEFRLevel, PracticeItem, PracticeLength, PracticeMode, SamplingStrategy } from "@/types/practice";
import { usePracticeStore } from "./usePracticeStore";

const LEVEL_ORDER: CEFRLevel[] = ["A1", "A2", "B1", "B2"];

const LENGTH_MAP: Record<PracticeLength, number> = {
  short: 5,
  medium: 10,
  long: 15,
};

function levelRank(level: CEFRLevel) {
  return LEVEL_ORDER.indexOf(level);
}

function pickLevels(selected: CEFRLevel, strategy: SamplingStrategy): CEFRLevel[] {
  if (strategy === "difficulty") {
    const maxIndex = levelRank(selected);
    return LEVEL_ORDER.slice(0, maxIndex + 1);
  }
  return [selected];
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

type ReviewItemResponse = {
  id: string;
  word: string;
  translation: string;
  mode: string;
  difficulty: string;
  sampleSentence: string;
  sentenceTranslation: string;
  tags?: string | null;
};

export function usePracticeSession() {
  const { difficulty, mode, practiceLength, sampling, reviewMode } = usePracticeStore();
  const [queue, setQueue] = useState<PracticeItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadQueue = useCallback(async () => {
    setLoading(true);
    const levels = pickLevels(difficulty, sampling);
    const payload = await Promise.all(levels.map((level) => loadVocabulary(level, mode)));
    const flattened = payload.flat().map((item, idx) => ({
      ...item,
      id: `${mode}-${item.word}-${idx}`,
      mode,
    }));

    let prepared: PracticeItem[] = flattened;
    if (sampling === "random") {
      prepared = shuffle(prepared);
    } else if (sampling === "difficulty") {
      prepared = prepared.sort((a, b) => levelRank(a.difficulty) - levelRank(b.difficulty));
    }

    const desiredLength = LENGTH_MAP[practiceLength];

    if (reviewMode) {
      try {
        const reviewRes = await fetch(`/api/review?limit=${desiredLength}`, { cache: "no-store" });
        if (reviewRes.ok) {
          const data = await reviewRes.json();
          const mapped: PracticeItem[] = (data.items as ReviewItemResponse[]).map((item) => ({
            id: `review-${item.id}`,
            mode: item.mode as PracticeMode,
            word: item.word,
            translation: item.translation,
            difficulty: item.difficulty as CEFRLevel,
            sample_sentence: item.sampleSentence,
            sentence_translation: item.sentenceTranslation,
            tags: item.tags ? item.tags.split(",") : undefined,
            collectionId: item.id,
          }));
          prepared = [...mapped, ...prepared];
        }
      } catch {
        // ignore network errors
      }
    }

    setQueue(prepared.slice(0, desiredLength));
    setCurrentIndex(0);
    setLoading(false);
  }, [difficulty, mode, practiceLength, sampling, reviewMode]);

  useEffect(() => {
    void loadQueue();
  }, [loadQueue]);

  const currentItem = queue[currentIndex] ?? null;
  const nextItem = queue[currentIndex + 1] ?? null;
  const progress = queue.length > 0 ? (currentIndex / queue.length) * 100 : 0;

  const advance = useCallback(() => {
    setCurrentIndex((prev) => Math.min(prev + 1, queue.length));
  }, [queue.length]);

  const sessionSummary = useMemo(
    () => ({
      total: queue.length,
      completed: Math.min(currentIndex, queue.length),
      remaining: Math.max(queue.length - currentIndex, 0),
    }),
    [queue.length, currentIndex]
  );

  return {
    queue,
    currentItem,
    nextItem,
    progress,
    loading,
    advance,
    reload: loadQueue,
    sessionSummary,
    practiceLength,
    mode,
  };
}
