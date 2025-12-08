import type { CollectionItem, Prisma } from "@prisma/client";
import type { PracticeMode, VocabItem } from "@/types/practice";
import { prisma } from "@/lib/prisma";
import { computeNextIntervalDays, nextReviewDate } from "@/lib/srs";

export async function listCollectionItems(userId: string) {
  return prisma.collectionItem.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });
}

export async function createCollectionItem(userId: string, item: VocabItem, mode: PracticeMode) {
  const payload: Prisma.CollectionItemCreateInput = {
    user: { connect: { id: userId } },
    word: item.word,
    translation: item.translation,
    mode,
    difficulty: item.difficulty,
    sampleSentence: item.sample_sentence,
    sentenceTranslation: item.sentence_translation,
    tags: item.tags?.join(","),
    nextReviewDate: nextReviewDate(1),
  };

  return prisma.collectionItem.upsert({
    where: {
      userId_word_mode: {
        userId,
        word: item.word,
        mode,
      },
    },
    update: {},
    create: payload,
  });
}

export async function deleteCollectionItem(userId: string, itemId: string) {
  return prisma.collectionItem.delete({
    where: {
      id: itemId,
      userId,
    },
  });
}

export async function updateCollectionPerformance(item: CollectionItem, wasCorrect: boolean) {
  const nextSeenCount = item.seenCount + 1;
  const previouslyCorrect = item.correctRate * item.seenCount;
  const newCorrect = wasCorrect ? previouslyCorrect + 1 : previouslyCorrect;
  const newRate = nextSeenCount === 0 ? 0 : newCorrect / nextSeenCount;
  const nextInterval = computeNextIntervalDays({
    currentIntervalDays: item.intervalDays,
    seenCount: nextSeenCount,
    correctRate: newRate,
    wasCorrect,
    difficulty: item.difficulty,
  });

  return prisma.collectionItem.update({
    where: { id: item.id },
    data: {
      seenCount: nextSeenCount,
      correctRate: newRate,
      lastSeen: new Date(),
      intervalDays: nextInterval,
      nextReviewDate: nextReviewDate(nextInterval),
    },
  });
}
