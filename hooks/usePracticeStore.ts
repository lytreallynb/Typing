import { create } from "zustand";
import type { CEFRLevel, PracticeLength, PracticeMode, SamplingStrategy } from "@/types/practice";

interface PracticeStore {
  difficulty: CEFRLevel;
  mode: PracticeMode;
  practiceLength: PracticeLength;
  sampling: SamplingStrategy;
  reviewMode: boolean;
  setDifficulty: (level: CEFRLevel) => void;
  setMode: (mode: PracticeMode) => void;
  setPracticeLength: (length: PracticeLength) => void;
  setSampling: (strategy: SamplingStrategy) => void;
  toggleReviewMode: () => void;
}

export const usePracticeStore = create<PracticeStore>((set) => ({
  difficulty: "A2",
  mode: "word",
  practiceLength: "medium",
  sampling: "sequential",
  reviewMode: false,
  setDifficulty: (level) => set({ difficulty: level }),
  setMode: (mode) => set({ mode }),
  setPracticeLength: (practiceLength) => set({ practiceLength }),
  setSampling: (sampling) => set({ sampling }),
  toggleReviewMode: () => set((state) => ({ reviewMode: !state.reviewMode })),
}));
