"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { TypingStats } from "@/types/lesson";
import { getSoundManager } from "@/utils/sounds";

export type TypingMode = "source" | "translation";

type NativeInputEvent = InputEvent & { data?: string; inputType?: string };

interface TypingAreaProps {
  onKeyPress: (key: string) => void;
  onStatsUpdate: (stats: TypingStats) => void;
  lessonText?: string;
  companionText?: string;
  companionLabel?: string;
  romanization?: string;
  sourceLang?: string;
  lessonId?: string;
  packId?: string;
  sourceLangCode?: string;
  translationLangCode?: string;
  difficultyLabel?: string;
  tags?: string[];
  imeHint?: string;
  typingMode: TypingMode;
  onLessonComplete?: (payload: {
    typedText: string;
    durationMs: number;
    targetText: string;
    typingMode: TypingMode;
    lessonId?: string;
    packId?: string;
    sourceLangCode?: string;
    translationLangCode?: string;
  }) => void;
}

interface CharacterState {
  char: string;
  status: "pending" | "correct" | "incorrect";
}

export default function TypingArea({
  onKeyPress,
  onStatsUpdate,
  lessonText = "The quick brown fox jumps over the lazy dog. Practice makes perfect!",
  companionText,
  companionLabel,
  romanization,
  sourceLang,
  lessonId,
  packId,
  sourceLangCode,
  translationLangCode,
  difficultyLabel,
  tags,
  imeHint,
  typingMode,
  onLessonComplete,
}: TypingAreaProps) {
  const [characters, setCharacters] = useState<CharacterState[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [errors, setErrors] = useState(0);
  const [correctChars, setCorrectChars] = useState(0);
  const [typedBuffer, setTypedBuffer] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hiddenInputRef = useRef<HTMLTextAreaElement>(null);
  const [isComposing, setIsComposing] = useState(false);
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
    setTypedBuffer("");
    setIsComplete(false);
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

  const focusHiddenInput = () => {
    hiddenInputRef.current?.focus();
  };

  const handleBackspace = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setCharacters((prev) => {
        const updated = [...prev];
        updated[currentIndex - 1].status = "pending";
        return updated;
      });
      if (characters[currentIndex - 1].status === "correct") {
        setCorrectChars((prev) => prev - 1);
      }
      setTypedBuffer((prev) => prev.slice(0, -1));
    }
  };

  const processChar = (char: string) => {
    if (!startTime && currentIndex === 0) {
      setStartTime(Date.now());
    }
    if (currentIndex >= characters.length) return;
    const expectedChar = characters[currentIndex].char;
    const isCorrect = char === expectedChar;
    if (isCorrect) {
      soundManager.playKeyPress();
    } else {
      soundManager.playError();
    }
    setCharacters((prev) => {
      const updated = [...prev];
      updated[currentIndex].status = isCorrect ? "correct" : "incorrect";
      return updated;
    });
    if (isCorrect) {
      setCorrectChars((prev) => prev + 1);
    } else {
      setErrors((prev) => prev + 1);
    }
    setCurrentIndex((prev) => prev + 1);
    setTypedBuffer((prev) => prev + char);
    if (currentIndex + 1 >= characters.length) {
      setTimeout(() => soundManager.playComplete(), 100);
    }
  };

  const handleTextInput = (text: string) => {
    if (!text) return;
    for (const char of Array.from(text)) {
      processChar(char);
    }
  };

  const handleInputEvent = (event: React.FormEvent<HTMLTextAreaElement>) => {
    const native = event.nativeEvent as NativeInputEvent;
    if (native.inputType === "deleteContentBackward") {
      handleBackspace();
    } else if (!isComposing) {
      const data = native.data;
      if (data) {
        handleTextInput(data);
      }
    }
    event.currentTarget.value = "";
  };

  const handleCompositionStart = () => setIsComposing(true);

  const handleCompositionEnd = (event: React.CompositionEvent<HTMLTextAreaElement>) => {
    setIsComposing(false);
    handleTextInput(event.data);
    event.currentTarget.value = "";
  };

  // Focus on mount
  useEffect(() => {
    focusHiddenInput();
  }, []);

  // Notify completion once per lesson
  useEffect(() => {
    if (
      !isComplete &&
      startTime &&
      characters.length > 0 &&
      currentIndex >= characters.length
    ) {
      setIsComplete(true);
      const durationMs = Date.now() - startTime;
      onLessonComplete?.({
        typedText: typedBuffer,
        durationMs,
        targetText: lessonText,
        typingMode,
        lessonId,
        packId,
        sourceLangCode,
        translationLangCode,
      });
    }
  }, [characters.length, currentIndex, isComplete, lessonText, onLessonComplete, startTime, typedBuffer, typingMode, lessonId, packId, sourceLangCode, translationLangCode]);

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      className="bg-white border-2 border-gray-200 rounded-3xl p-12 mb-12 focus:outline-none focus:border-blue-400 transition-colors relative"
      onClick={focusHiddenInput}
    >
      <textarea
        ref={hiddenInputRef}
        className="absolute inset-0 opacity-0 pointer-events-none"
        aria-hidden="true"
        autoCorrect="off"
        autoCapitalize="none"
        spellCheck={false}
        onInput={handleInputEvent}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
      />
      <div className="flex items-center justify-between mb-6 text-sm text-gray-400">
        <span>
          {typingMode === "translation" ? "Typing (translation)" : "Typing"} · {sourceLang || ""}
        </span>
        {characters.length > 0 && (
          <span>
            {currentIndex}/{characters.length} characters
          </span>
        )}
      </div>

      {(difficultyLabel || (tags && tags.length > 0)) && (
        <div className="flex flex-wrap gap-2 mb-4">
          {difficultyLabel && (
            <span className="px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full">
              Level: {difficultyLabel}
            </span>
          )}
          {(tags || []).slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 text-xs text-gray-600 bg-gray-100 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {imeHint && (
        <div className="mb-4 text-xs text-blue-700 bg-blue-50 border border-blue-100 rounded-2xl px-3 py-2">
          {imeHint}
        </div>
      )}
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

      {(companionText || romanization) && (
        <div className="mt-8 rounded-2xl border border-gray-100 bg-gray-50 p-5 text-gray-700">
          {companionText && (
            <p className="text-base font-medium">
              {companionLabel ? `${companionLabel}:` : "Reference:"}
              <span className="font-normal ml-2">{companionText}</span>
            </p>
          )}
          {romanization && (
            <p className="text-sm text-gray-500 mt-2">
              Romanization: <span className="font-medium text-gray-700">{romanization}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
