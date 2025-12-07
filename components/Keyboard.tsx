"use client";

import { useEffect, useState } from "react";
import keyboardData from "@/data/keyboardMapping.json";

interface KeyboardProps {
  highlightedKey: string;
}

interface KeyProps {
  keyChar: string;
  isHighlighted: boolean;
  finger: string;
}

const Key = ({ keyChar, isHighlighted, finger }: KeyProps) => {
  const fingerColors: Record<string, string> = {
    "left-pinky": "bg-rose-50",
    "left-ring": "bg-violet-50",
    "left-middle": "bg-sky-50",
    "left-index": "bg-emerald-50",
    "left-thumb": "bg-gray-50",
    "right-thumb": "bg-gray-50",
    "right-index": "bg-emerald-50",
    "right-middle": "bg-sky-50",
    "right-ring": "bg-violet-50",
    "right-pinky": "bg-rose-50",
  };

  const baseColor = fingerColors[finger] || "bg-gray-50";
  const width = keyChar === " " ? "w-96" : "w-14";

  return (
    <div
      className={`
        ${width} h-14 rounded-xl flex items-center justify-center
        font-medium text-sm transition-all duration-200 border
        ${isHighlighted
          ? "border-blue-400 scale-105 bg-blue-100 text-blue-900 shadow-md"
          : `border-gray-200 ${baseColor} text-gray-600`
        }
      `}
    >
      {keyChar === " " ? "Space" : keyChar}
    </div>
  );
};

export default function Keyboard({ highlightedKey }: KeyboardProps) {
  const [keyMap, setKeyMap] = useState<Map<string, any>>(new Map());

  useEffect(() => {
    const map = new Map();
    keyboardData.keys.forEach((key) => {
      map.set(key.key.toLowerCase(), key);
    });
    setKeyMap(map);
  }, []);

  const rows = [
    ["`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "="],
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]", "\\"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'"],
    ["z", "x", "c", "v", "b", "n", "m", ",", ".", "/"],
    [" "],
  ];

  return (
    <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
      <div className="flex flex-col items-center gap-2">
        {rows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="flex gap-2 justify-center"
            style={{ paddingLeft: rowIndex === 1 ? "28px" : rowIndex === 2 ? "42px" : rowIndex === 3 ? "56px" : "0" }}
          >
            {row.map((keyChar) => {
              const keyData = keyMap.get(keyChar.toLowerCase());
              return (
                <Key
                  key={keyChar}
                  keyChar={keyChar}
                  isHighlighted={highlightedKey.toLowerCase() === keyChar.toLowerCase()}
                  finger={keyData?.finger || "left-pinky"}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
