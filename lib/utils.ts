import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const LEVEL_LABELS = {
  A1: "A1 · 基础",
  A2: "A2 · 初级",
  B1: "B1 · 中级",
  B2: "B2 · 中高级",
};

export const PRACTICE_LENGTH_LABELS = {
  short: "Short · 5",
  medium: "Medium · 10",
  long: "Long · 15",
};
