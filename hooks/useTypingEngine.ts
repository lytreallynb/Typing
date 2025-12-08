import { useCallback, useEffect, useMemo, useState } from "react";
import { calculateStats, createCharacters, updateCharacterState } from "@/lib/typingEngine";
import type { TypingCharacter, TypingStats } from "@/types/practice";

export interface TypingMistake {
  index: number;
  expected: string;
  actual: string;
  timestamp: number;
}

interface UseTypingEngineOptions {
  onComplete?: (stats: TypingStats, mistakes: TypingMistake[]) => void;
  playSound?: (event: "correct" | "incorrect" | "complete") => void;
}

export function useTypingEngine(targetText: string, options: UseTypingEngineOptions = {}) {
  const [characters, setCharacters] = useState<TypingCharacter[]>(() => createCharacters(targetText));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [errors, setErrors] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [typedValue, setTypedValue] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [mistakes, setMistakes] = useState<TypingMistake[]>([]);

  useEffect(() => {
    setCharacters(createCharacters(targetText));
    setCurrentIndex(0);
    setStartTime(null);
    setErrors(0);
    setCorrect(0);
    setTypedValue("");
    setIsComplete(false);
    setMistakes([]);
  }, [targetText]);

  const stats = useMemo(
    () => calculateStats({ characters, currentIndex, startTime, errors, correct }),
    [characters, currentIndex, startTime, errors, correct]
  );

  const handleBackspace = useCallback(() => {
    if (currentIndex === 0 || isComplete) return;
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
    setCharacters((prev) => updateCharacterState(prev, currentIndex - 1, "pending"));
    setTypedValue((prev) => prev.slice(0, -1));
  }, [currentIndex, isComplete]);

  const registerCompletion = useCallback(
    (nextStats: TypingStats) => {
      if (isComplete) return;
      setIsComplete(true);
      options.playSound?.("complete");
      options.onComplete?.(nextStats, mistakes);
    },
    [isComplete, options, mistakes]
  );

  const handleCharacter = useCallback(
    (char: string) => {
      if (isComplete) return;
      if (!startTime && currentIndex === 0) {
        setStartTime(Date.now());
      }
      if (currentIndex >= characters.length) {
        registerCompletion(stats);
        return;
      }
      const expected = characters[currentIndex]?.char ?? "";
      const isCorrect = char === expected;

      setCharacters((prev) => updateCharacterState(prev, currentIndex, isCorrect ? "correct" : "incorrect"));
      setCurrentIndex((prev) => prev + 1);
      setTypedValue((prev) => prev + char);
      if (isCorrect) {
        options.playSound?.("correct");
        setCorrect((prev) => prev + 1);
      } else {
        options.playSound?.("incorrect");
        setErrors((prev) => prev + 1);
        setMistakes((prev) => [
          ...prev,
          {
            index: currentIndex,
            expected,
            actual: char,
            timestamp: Date.now(),
          },
        ]);
      }

      if (currentIndex + 1 === characters.length) {
        const nextStats = calculateStats({
          characters,
          currentIndex: currentIndex + 1,
          startTime: startTime ?? Date.now(),
          errors: isCorrect ? errors : errors + 1,
          correct: isCorrect ? correct + 1 : correct,
        });
        registerCompletion(nextStats);
      }
    },
    [
      characters,
      currentIndex,
      correct,
      errors,
      isComplete,
      options,
      registerCompletion,
      startTime,
      stats,
    ]
  );

  return {
    characters,
    currentIndex,
    typedValue,
    stats,
    isComplete,
    mistakes,
    handleCharacter,
    handleBackspace,
  };
}
