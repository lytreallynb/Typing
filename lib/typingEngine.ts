import type { TypingCharacter, TypingStats } from "@/types/practice";

export interface TypingEngineState {
  characters: TypingCharacter[];
  currentIndex: number;
  startTime: number | null;
  errors: number;
  correct: number;
}

export function createCharacters(text: string): TypingCharacter[] {
  return text.split("").map((char) => ({
    char,
    status: "pending" as const,
  }));
}

export function calculateStats(state: TypingEngineState): TypingStats {
  if (!state.startTime) {
    return {
      wpm: 0,
      accuracy: 100,
      elapsedMs: 0,
      errors: 0,
    };
  }

  const elapsedMs = Date.now() - state.startTime;
  const minutes = elapsedMs / 60000;
  const wordsTyped = state.correct / 5;

  return {
    wpm: minutes > 0 ? Math.round(wordsTyped / minutes) : 0,
    accuracy: state.currentIndex > 0 ? Math.round((state.correct / state.currentIndex) * 100) : 100,
    elapsedMs,
    errors: state.errors,
  };
}

export function updateCharacterState(
  characters: TypingCharacter[],
  index: number,
  status: TypingCharacter["status"]
): TypingCharacter[] {
  const updated = [...characters];
  if (updated[index]) {
    updated[index] = { ...updated[index], status };
  }
  return updated;
}
