import { getDatasetMap } from "@/lib/datasetRegistry";
import type { CEFRLevel, PracticeMode, VocabItem } from "@/types/practice";

const datasets = getDatasetMap();

export async function loadVocabulary(level: CEFRLevel, mode: PracticeMode = "word"): Promise<VocabItem[]> {
  const source = datasets[mode]?.[level] ?? [];
  return Promise.resolve([...source]);
}

export function getRandomWord(level: CEFRLevel): VocabItem {
  const items = datasets.word[level] ?? [];
  if (items.length === 0) {
    throw new Error(`No word data for level ${level}`);
  }
  return items[Math.floor(Math.random() * items.length)]!;
}

export function getRandomSentence(level: CEFRLevel): VocabItem {
  const items = datasets.sentence[level] ?? [];
  if (items.length === 0) {
    throw new Error(`No sentence data for level ${level}`);
  }
  return items[Math.floor(Math.random() * items.length)]!;
}

export function getSequential(mode: PracticeMode, level: CEFRLevel, index: number): VocabItem {
  const source = datasets[mode]?.[level] ?? [];
  if (source.length === 0) {
    throw new Error(`No ${mode} data for level ${level}`);
  }
  const safeIndex = ((index % source.length) + source.length) % source.length;
  return source[safeIndex]!;
}

export function getAllVocabulary(mode: PracticeMode): Record<CEFRLevel, VocabItem[]> {
  return datasets[mode];
}
