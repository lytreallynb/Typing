"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { TypingStats } from "@/types/lesson";
import { getSoundManager } from "@/utils/sounds";

interface TypingAreaProps {
  onKeyPress: (key: string) => void;
  onStatsUpdate: (stats: TypingStats) => void;
  lessonText?: string;
}

interface CharacterState {
  char: string;
  status: "pending" | "correct" | "incorrect";
}

export default function TypingArea({
  onKeyPress,
  onStatsUpdate,
  lessonText = "The quick brown fox jumps over the lazy dog. Practice makes perfect!",
}: TypingAreaProps) {
  const [characters, setCharacters] = useState<CharacterState[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [errors, setErrors] = useState(0);
  const [correctChars, setCorrectChars] = useState(0);
  const inputRef = useRef<HTMLDivElement>(null);
  const soundManager = getSoundManager();

  // Initialize characters from lesson text
  useEffect(() => {
    const chars: CharacterState[] = lessonText.split("").map((char) => ({
      char,
      status: "pending",
    }));
    setCharacters(chars);
    setCurrentIndex(0);
    setStartTime(null);
    setErrors(0);
    setCorrectChars(0);
  }, [lessonText]);

  // Calculate and update stats
  const updateStats = useCallback(() => {
    if (!startTime) return;

    const elapsedMinutes = (Date.now() - startTime) / 60000;
    const wordsTyped = correctChars / 5; // Standard: 5 characters = 1 word
    const wpm = elapsedMinutes > 0 ? Math.round(wordsTyped / elapsedMinutes) : 0;
    const totalAttempted = currentIndex;
    const accuracy = totalAttempted > 0 ? Math.round((correctChars / totalAttempted) * 100) : 100;
    const progress = Math.round((currentIndex / characters.length) * 100);

    onStatsUpdate({
      wpm,
      accuracy,
      errors,
      progress,
    });
  }, [startTime, correctChars, currentIndex, characters.length, errors, onStatsUpdate]);

  useEffect(() => {
    updateStats();
  }, [currentIndex, correctChars, errors, updateStats]);

  // Update current key for highlighting
  useEffect(() => {
    if (currentIndex < characters.length) {
      onKeyPress(characters[currentIndex].char);
    } else {
      onKeyPress("");
    }
  }, [currentIndex, characters, onKeyPress]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore special keys except space and backspace
      if (e.key.length > 1 && e.key !== "Backspace") return;

      e.preventDefault();

      // Start timer on first keystroke
      if (!startTime && currentIndex === 0) {
        setStartTime(Date.now());
      }

      if (e.key === "Backspace") {
        if (currentIndex > 0) {
          setCurrentIndex((prev) => prev - 1);
          setCharacters((prev) => {
            const newChars = [...prev];
            newChars[currentIndex - 1].status = "pending";
            return newChars;
          });
          // Adjust stats if backspacing a correct character
          if (characters[currentIndex - 1].status === "correct") {
            setCorrectChars((prev) => prev - 1);
          }
        }
        return;
      }

      if (currentIndex >= characters.length) return;

      const expectedChar = characters[currentIndex].char;
      const isCorrect = e.key === expectedChar;

      // Play sound based on correctness
      if (isCorrect) {
        soundManager.playKeyPress();
      } else {
        soundManager.playError();
      }

      setCharacters((prev) => {
        const newChars = [...prev];
        newChars[currentIndex].status = isCorrect ? "correct" : "incorrect";
        return newChars;
      });

      if (isCorrect) {
        setCorrectChars((prev) => prev + 1);
      } else {
        setErrors((prev) => prev + 1);
      }

      setCurrentIndex((prev) => prev + 1);

      // Play completion sound when lesson is finished
      if (currentIndex + 1 >= characters.length) {
        setTimeout(() => soundManager.playComplete(), 100);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, characters, startTime]);

  // Focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div
      ref={inputRef}
      tabIndex={0}
      className="bg-white border-2 border-gray-200 rounded-3xl p-12 mb-12 focus:outline-none focus:border-blue-400 transition-colors"
    >
      <div className="text-3xl leading-loose font-light tracking-wide text-gray-800 min-h-[200px] break-words overflow-wrap-anywhere">
        {characters.map((charState, index) => {
          const isCurrent = index === currentIndex;
          let className = "transition-all duration-150 inline ";

          if (isCurrent) {
            className += "bg-blue-100 border-b-2 border-blue-500 ";
          } else if (charState.status === "correct") {
            className += "text-gray-900 ";
          } else if (charState.status === "incorrect") {
            className += "text-red-500 bg-red-50 ";
          } else {
            className += "text-gray-300 ";
          }

          return (
            <span key={index} className={className}>
              {charState.char === " " ? "\u00A0" : charState.char}
            </span>
          );
        })}
      </div>

      <div className="mt-8 text-center text-sm text-gray-400 font-light">
        {currentIndex >= characters.length ? (
          <p className="text-blue-600 font-medium text-lg">
            Complete
          </p>
        ) : (
          <p>
            Click to start typing · Backspace to correct
          </p>
        )}
      </div>
    </div>
  );
}
