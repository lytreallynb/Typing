export interface LessonTranslationMap {
  [lang: string]: string;
}

export interface PackSummary {
  id: string;
  name: string;
  languages: string[];
  license?: string;
  source?: string;
  topics?: string[];
  notes?: string;
  count?: number;
}

export interface PackItem {
  id: string;
  type: string;
  lang: string;
  text: string;
  romanization?: string;
  translation?: LessonTranslationMap;
  tags?: string[];
  difficulty?: Record<string, number | string>;
  source?: string;
  license?: string;
}

export interface Lesson {
  id: string;
  title: string;
  description?: string;
  difficulty?: "beginner" | "intermediate" | "advanced" | string;
  type?: "characters" | "words" | "sentences" | "mixed" | string;
  content: string;
  lang?: string;
  translation?: LessonTranslationMap;
  romanization?: string;
  packId?: string;
  pack?: PackSummary | null;
  tags?: string[];
  source?: string;
  license?: string;
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

export interface AttemptPayload {
  user_id: string;
  item_id: string;
  lang: string;
  typed_text: string;
  target_text: string;
  duration_ms: number;
  pack_id?: string;
}

export interface ProgressStats {
  attempts: number;
  wpm: number;
  cpm?: number;
  cer: number;
}

export interface PackProgress extends ProgressStats {
  pack_id: string;
}

export interface StreakData {
  current_streak: number;
  longest_streak: number;
  last_practice_date?: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: "bronze" | "silver" | "gold" | "platinum";
  earned: boolean;
  earned_at?: string;
  progress?: number;
  criteria?: string;
}

export interface UserAchievements {
  total_achievements: number;
  earned_count: number;
  achievements: Achievement[];
}

export interface UserProgress {
  overall?: ProgressStats;
  per_pack: PackProgress[];
  streak?: StreakData;
}

export interface ExternalSourceInfo {
  id: string;
  name: string;
  description?: string;
  url?: string;
  license?: string;
  topics?: string[];
  languages?: string[];
}

export interface ExternalSourcePayload {
  pack: PackSummary;
  items: PackItem[];
}
