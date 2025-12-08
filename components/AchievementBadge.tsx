"use client";

import type { Achievement, UserAchievements } from "@/types/lesson";
import { useEffect, useState } from "react";
import { fetchUserAchievements } from "@/utils/api";

interface AchievementBadgeProps {
  achievement: Achievement;
  compact?: boolean;
}

function AchievementBadge({ achievement, compact = false }: AchievementBadgeProps) {
  const tierColors = {
    bronze: "from-amber-600 to-orange-700",
    silver: "from-gray-400 to-gray-600",
    gold: "from-yellow-400 to-yellow-600",
    platinum: "from-cyan-400 to-blue-600",
  };

  const tierBorderColors = {
    bronze: "border-amber-300",
    silver: "border-gray-300",
    gold: "border-yellow-300",
    platinum: "border-cyan-300",
  };

  if (compact) {
    return (
      <div
        className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${
          achievement.earned
            ? `bg-gradient-to-r ${tierColors[achievement.tier]} text-white`
            : "bg-gray-100 text-gray-400"
        }`}
        title={achievement.description}
      >
        <span>{achievement.earned ? "✓" : "○"}</span>
        <span>{achievement.name}</span>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl border-2 p-4 transition-all ${
        achievement.earned
          ? `${tierBorderColors[achievement.tier]} bg-white dark:bg-gray-700 shadow-sm`
          : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`rounded-xl p-3 ${
            achievement.earned
              ? `bg-gradient-to-br ${tierColors[achievement.tier]} text-white`
              : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500"
          }`}
        >
          <div className="text-2xl">{achievement.earned ? "🏆" : "🔒"}</div>
        </div>
        <div className="flex-1">
          <div
            className={`font-semibold ${
              achievement.earned ? "text-gray-900 dark:text-gray-100" : "text-gray-400 dark:text-gray-500"
            }`}
          >
            {achievement.name}
          </div>
          <div
            className={`text-sm ${
              achievement.earned ? "text-gray-600 dark:text-gray-300" : "text-gray-400 dark:text-gray-500"
            }`}
          >
            {achievement.description}
          </div>
          {achievement.earned && achievement.earned_at && (
            <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Earned {new Date(achievement.earned_at).toLocaleDateString()}
            </div>
          )}
        </div>
        <div className="text-xs font-semibold uppercase text-gray-400 dark:text-gray-500">
          {achievement.tier}
        </div>
      </div>
    </div>
  );
}

interface AchievementsDisplayProps {
  userId: string;
}

export default function AchievementsDisplay({ userId }: AchievementsDisplayProps) {
  const [achievements, setAchievements] = useState<UserAchievements | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAchievements = async () => {
      try {
        setLoading(true);
        const data = await fetchUserAchievements(userId);
        setAchievements(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load achievements");
      } finally {
        setLoading(false);
      }
    };

    loadAchievements();
  }, [userId]);

  if (loading) {
    return (
      <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
        Loading achievements...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-100 dark:border-red-900 bg-red-50 dark:bg-red-900/20 px-6 py-4 text-sm text-red-600 dark:text-red-400">
        {error}
      </div>
    );
  }

  if (!achievements) {
    return null;
  }

  const earnedAchievements = achievements.achievements.filter((a) => a.earned);
  const lockedAchievements = achievements.achievements.filter((a) => !a.earned);

  return (
    <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 px-6 py-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          Achievements
        </h3>
        <div className="text-sm text-gray-600 dark:text-gray-300">
          <span className="font-semibold text-gray-900 dark:text-gray-100">{achievements.earned_count}</span> / {achievements.total_achievements}
        </div>
      </div>

      {earnedAchievements.length > 0 && (
        <div className="mb-6">
          <h4 className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3">
            Unlocked
          </h4>
          <div className="grid gap-3 sm:grid-cols-2">
            {earnedAchievements.map((achievement) => (
              <AchievementBadge key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </div>
      )}

      {lockedAchievements.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3">
            Locked
          </h4>
          <div className="grid gap-3 sm:grid-cols-2">
            {lockedAchievements.slice(0, 6).map((achievement) => (
              <AchievementBadge key={achievement.id} achievement={achievement} />
            ))}
          </div>
          {lockedAchievements.length > 6 && (
            <div className="text-xs text-gray-400 dark:text-gray-500 text-center mt-3">
              +{lockedAchievements.length - 6} more to unlock
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export { AchievementBadge };
