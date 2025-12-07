export interface Lesson {
  id: string;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  type: "characters" | "words" | "sentences" | "mixed";
  content: string;
}

export interface TypingStats {
  wpm: number;
  accuracy: number;
  errors: number;
  progress: number;
}

export interface KeyMapping {
  key: string;
  finger: "left-pinky" | "left-ring" | "left-middle" | "left-index" | "left-thumb" | "right-thumb" | "right-index" | "right-middle" | "right-ring" | "right-pinky";
  row: number;
  position: number;
}
