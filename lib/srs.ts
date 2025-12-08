const MIN_INTERVAL = 1; // days
const MAX_INTERVAL = 60;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function computeNextIntervalDays({
  currentIntervalDays,
  seenCount,
  correctRate,
  wasCorrect,
  difficulty,
}: {
  currentIntervalDays: number;
  seenCount: number;
  correctRate: number;
  wasCorrect: boolean;
  difficulty: string;
}) {
  if (!wasCorrect) {
    return MIN_INTERVAL;
  }
  const baseMultiplier = difficulty.startsWith("B") ? 1.3 : 1.6;
  const stability = correctRate > 0 ? correctRate : 0.5;
  const growth = baseMultiplier + seenCount * 0.05 + stability * 0.5;
  const next = currentIntervalDays * growth;
  return clamp(next, MIN_INTERVAL, MAX_INTERVAL);
}

export function nextReviewDate(intervalDays: number) {
  const result = new Date();
  result.setDate(result.getDate() + Math.round(intervalDays));
  return result;
}
