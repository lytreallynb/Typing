import lessonsData from "@/data/lessons.json";
import wikivoyageMeta from "@/packs/wikivoyage-travel-zh-en/metadata.json";
import wikivoyageItemsJson from "@/packs/wikivoyage-travel-zh-en/items.json";
import tatoebaMeta from "@/packs/tatoeba-phrases-en-zh/metadata.json";
import tatoebaItemsJson from "@/packs/tatoeba-phrases-en-zh/items.json";
import type {
  ExternalSourceInfo,
  ExternalSourcePayload,
  Lesson,
  PackItem,
  PackSummary,
  UserAchievements,
  UserProgress,
} from "@/types/lesson";

const LESSONS = lessonsData as Lesson[];

export const OFFLINE_LOCAL_PACK: PackSummary = {
  id: "local-basic",
  name: "Local Practice Lessons",
  languages: ["en"],
  source: "Bundled lessons.json",
  topics: ["typing", "home-row"],
  license: "Demo content",
  count: LESSONS.length,
};

export const OFFLINE_LOCAL_LESSONS: Lesson[] = LESSONS.map((lesson) => ({
  ...lesson,
  packId: OFFLINE_LOCAL_PACK.id,
  pack: OFFLINE_LOCAL_PACK,
  lang: lesson.lang || "en",
}));

const localPackItems: PackItem[] = OFFLINE_LOCAL_LESSONS.map((lesson) => ({
  id: lesson.id,
  type: lesson.type || "sentences",
  lang: lesson.lang || "en",
  text: lesson.content,
  translation: lesson.translation,
  romanization: lesson.romanization,
  tags: lesson.tags,
  difficulty: lesson.difficulty ? { level: lesson.difficulty } : undefined,
  source: lesson.source || "Bundled practice lesson",
  license: lesson.license || "Demo content",
}));

const wikivoyageItems = wikivoyageItemsJson as PackItem[];
const WIKIVOYAGE_PACK: PackSummary = {
  ...(wikivoyageMeta as PackSummary),
  count: (wikivoyageMeta as PackSummary).count ?? wikivoyageItems.length,
};

const tatoebaItems = tatoebaItemsJson as PackItem[];
const TATOEBA_PACK: PackSummary = {
  ...(tatoebaMeta as PackSummary),
  count: (tatoebaMeta as PackSummary).count ?? tatoebaItems.length,
};

export const OFFLINE_PACK_ITEMS: Record<string, PackItem[]> = {
  [OFFLINE_LOCAL_PACK.id]: localPackItems,
  [WIKIVOYAGE_PACK.id]: wikivoyageItems,
  [TATOEBA_PACK.id]: tatoebaItems,
};

export const OFFLINE_PACKS: PackSummary[] = [OFFLINE_LOCAL_PACK, WIKIVOYAGE_PACK, TATOEBA_PACK];

export const OFFLINE_REMOTE_PACKS: PackSummary[] = [WIKIVOYAGE_PACK, TATOEBA_PACK];

export const OFFLINE_DEFAULT_LESSON = OFFLINE_LOCAL_LESSONS[0];

export const OFFLINE_PROGRESS: UserProgress = {
  overall: {
    attempts: 18,
    wpm: 52.4,
    cpm: 265.1,
    cer: 0.028,
  },
  per_pack: [
    { pack_id: OFFLINE_LOCAL_PACK.id, attempts: 9, wpm: 54.2, cpm: 272.6, cer: 0.025 },
    { pack_id: WIKIVOYAGE_PACK.id, attempts: 5, wpm: 47.8, cpm: 240.9, cer: 0.033 },
    { pack_id: TATOEBA_PACK.id, attempts: 4, wpm: 50.1, cpm: 252.4, cer: 0.03 },
  ],
  streak: {
    current_streak: 3,
    longest_streak: 7,
    last_practice_date: "2025-02-10",
  },
};

export const OFFLINE_ACHIEVEMENTS: UserAchievements = {
  total_achievements: 8,
  earned_count: 3,
  achievements: [
    {
      id: "first-lesson",
      name: "First Lesson",
      description: "Complete your first practice session.",
      icon: "🎯",
      tier: "bronze",
      earned: true,
      earned_at: "2025-01-05",
    },
    {
      id: "streak-3",
      name: "Keep It Going",
      description: "Maintain a 3-day streak.",
      icon: "🔥",
      tier: "silver",
      earned: true,
      earned_at: "2025-02-10",
    },
    {
      id: "accuracy-95",
      name: "Precision Typist",
      description: "Finish a lesson with 95% accuracy.",
      icon: "🎖️",
      tier: "silver",
      earned: true,
      earned_at: "2025-02-08",
    },
    {
      id: "ten-lessons",
      name: "Consistent Practice",
      description: "Complete 10 lessons total.",
      icon: "🏅",
      tier: "gold",
      earned: false,
      progress: 8,
      criteria: "Complete 10 total lessons",
    },
    {
      id: "streak-14",
      name: "Two-Week Warrior",
      description: "Keep a 14-day streak alive.",
      icon: "⚡️",
      tier: "gold",
      earned: false,
    },
    {
      id: "wpm-65",
      name: "Speed Runner",
      description: "Reach 65 WPM in a recorded attempt.",
      icon: "🚀",
      tier: "gold",
      earned: false,
    },
    {
      id: "translation-pro",
      name: "Translation Pro",
      description: "Finish 5 translation-mode lessons.",
      icon: "🌐",
      tier: "platinum",
      earned: false,
    },
    {
      id: "night-owl",
      name: "Night Owl",
      description: "Complete a lesson after midnight.",
      icon: "🌙",
      tier: "bronze",
      earned: false,
    },
  ],
};

export const OFFLINE_EXTERNAL_SOURCES: ExternalSourceInfo[] = [
  {
    id: WIKIVOYAGE_PACK.id,
    name: WIKIVOYAGE_PACK.name,
    description: "Travel phrasebook sentences for zh→en learners.",
    url: "https://www.wikivoyage.org",
    license: WIKIVOYAGE_PACK.license,
    topics: WIKIVOYAGE_PACK.topics,
    languages: WIKIVOYAGE_PACK.languages,
  },
  {
    id: TATOEBA_PACK.id,
    name: TATOEBA_PACK.name,
    description: "Conversational EN→ZH snippets from the community.",
    url: "https://tatoeba.org",
    license: TATOEBA_PACK.license,
    topics: TATOEBA_PACK.topics,
    languages: TATOEBA_PACK.languages,
  },
];

export const OFFLINE_EXTERNAL_PAYLOADS: Record<string, ExternalSourcePayload> = {
  [WIKIVOYAGE_PACK.id]: {
    pack: WIKIVOYAGE_PACK,
    items: wikivoyageItems,
  },
  [TATOEBA_PACK.id]: {
    pack: TATOEBA_PACK,
    items: tatoebaItems,
  },
};
