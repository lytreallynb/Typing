"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export interface CollectionListItem {
  id: string;
  word: string;
  translation: string;
  difficulty: string;
  mode: string;
  lastSeen?: string | null;
  nextReviewDate?: string | null;
  seenCount: number;
  correctRate: number;
}

interface CollectionListProps {
  initialItems: CollectionListItem[];
}

export function CollectionList({ initialItems }: CollectionListProps) {
  const [items, setItems] = useState(initialItems);

  const handleDelete = async (id: string) => {
    await fetch(`/api/collection/${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  if (items.length === 0) {
    return <p className="text-sm text-gray-500">No items saved yet. Practice and add words to build your collection.</p>;
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-gray-200 bg-white/90 p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">{item.word}</h3>
              <p className="text-sm text-gray-500">{item.translation}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}>
              Remove
            </Button>
          </div>
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-500">
            <span>Mode: {item.mode}</span>
            <span>Difficulty: {item.difficulty}</span>
            <span>Seen: {item.seenCount}</span>
            <span>Accuracy: {(item.correctRate * 100).toFixed(0)}%</span>
            {item.nextReviewDate && <span>Next review: {new Date(item.nextReviewDate).toLocaleDateString()}</span>}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
