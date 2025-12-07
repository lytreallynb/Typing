"use client";

import type { TypingStats } from "@/types/lesson";

interface StatsDisplayProps {
  stats: TypingStats;
}

interface StatCardProps {
  label: string;
  value: number | string;
  unit?: string;
}

const StatCard = ({ label, value, unit }: StatCardProps) => {
  return (
    <div className="bg-gray-50 rounded-2xl px-6 py-5 border border-gray-100">
      <div className="text-sm text-gray-500 font-medium mb-1">
        {label}
      </div>
      <div className="text-4xl font-light text-gray-900">
        {value}
        {unit && <span className="text-2xl text-gray-400 ml-2">{unit}</span>}
      </div>
    </div>
  );
};

export default function StatsDisplay({ stats }: StatsDisplayProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
      <StatCard
        label="Speed"
        value={stats.wpm}
        unit="WPM"
      />
      <StatCard
        label="Accuracy"
        value={stats.accuracy}
        unit="%"
      />
      <StatCard
        label="Errors"
        value={stats.errors}
      />
      <StatCard
        label="Progress"
        value={stats.progress}
        unit="%"
      />
    </div>
  );
}
