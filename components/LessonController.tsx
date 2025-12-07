"use client";

import { useState, useEffect } from "react";
import type { Lesson } from "@/types/lesson";
import lessonsData from "@/data/lessons.json";

interface LessonControllerProps {
  onLessonSelect: (lesson: Lesson) => void;
  currentLessonId?: string;
}

export default function LessonController({
  onLessonSelect,
  currentLessonId,
}: LessonControllerProps) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  useEffect(() => {
    setLessons(lessonsData as Lesson[]);
    if (lessonsData.length > 0 && !currentLessonId) {
      const firstLesson = lessonsData[0] as Lesson;
      setSelectedLesson(firstLesson);
      onLessonSelect(firstLesson);
    }
  }, [currentLessonId, onLessonSelect]);

  const handleLessonSelect = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    onLessonSelect(lesson);
  };

  return (
    <div className="mb-12">
      <h2 className="text-sm font-medium text-gray-500 mb-4 uppercase tracking-wide">
        Lessons
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {lessons.map((lesson) => (
          <button
            key={lesson.id}
            onClick={() => handleLessonSelect(lesson)}
            className={`
              text-left px-4 py-3 rounded-xl transition-all duration-200 border overflow-hidden
              ${
                selectedLesson?.id === lesson.id
                  ? "border-blue-400 bg-blue-50 shadow-sm"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
              }
            `}
          >
            <div className="text-xs font-medium text-gray-400 mb-1 truncate">
              {lesson.type}
            </div>
            <div className="text-sm font-medium text-gray-900 line-clamp-2">
              {lesson.title}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
