"use client";

import { useState } from "react";
import TypingArea from "@/components/TypingArea";
import Keyboard from "@/components/Keyboard";
import HandsDisplay from "@/components/HandsDisplay";
import StatsDisplay from "@/components/StatsDisplay";
import LessonController from "@/components/LessonController";
import SoundSettings from "@/components/SoundSettings";
import type { Lesson } from "@/types/lesson";

export default function Home() {
  const [currentKey, setCurrentKey] = useState<string>("");
  const [stats, setStats] = useState({
    wpm: 0,
    accuracy: 100,
    errors: 0,
    progress: 0,
  });
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [lessonKey, setLessonKey] = useState(0); // Key to force remount of TypingArea

  const handleLessonSelect = (lesson: Lesson) => {
    setCurrentLesson(lesson);
    setLessonKey((prev) => prev + 1); // Force remount
    setStats({
      wpm: 0,
      accuracy: 100,
      errors: 0,
      progress: 0,
    });
    setCurrentKey("");
  };

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <header className="mb-16">
          <div className="flex justify-between items-start">
            <div className="flex-1 text-center">
              <h1 className="text-5xl font-light text-gray-900 mb-3 tracking-tight">
                Type
              </h1>
              <p className="text-gray-500 text-lg font-light">
                Master touch typing with visual guidance
              </p>
            </div>
            <div className="absolute right-6 top-12">
              <SoundSettings />
            </div>
          </div>
        </header>

        {/* Stats */}
        <StatsDisplay stats={stats} />

        {/* Typing Area */}
        <TypingArea
          key={lessonKey}
          onKeyPress={setCurrentKey}
          onStatsUpdate={setStats}
          lessonText={currentLesson?.content}
        />

        {/* Hands and Keyboard in two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <HandsDisplay currentKey={currentKey} />
          <Keyboard highlightedKey={currentKey} />
        </div>

        {/* Lesson Selector */}
        <LessonController
          onLessonSelect={handleLessonSelect}
          currentLessonId={currentLesson?.id}
        />
      </div>
    </main>
  );
}
