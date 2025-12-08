export type CEFRLevel = "A1" | "A2" | "B1" | "B2";

export type PracticeMode = "word" | "sentence";

export type PracticeLength = "short" | "medium" | "long";

export type SamplingStrategy = "sequential" | "random" | "difficulty";

export interface VocabItem {
  word: string;
  translation: string;
  difficulty: CEFRLevel;
  sample_sentence: string;
  sentence_translation: string;
  tags?: string[];
  frequency?: number;
  phonetics?: {
    uk?: string;
    us?: string;
  };
}

export interface PracticeItem extends VocabItem {
  id: string;
  mode: PracticeMode;
  collectionId?: string;
}

export interface TypingCharacter {
  char: string;
  status: "pending" | "correct" | "incorrect";
}

export interface TypingStats {
  wpm: number;
  accuracy: number;
  elapsedMs: number;
  errors: number;
}
