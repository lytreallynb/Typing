"use client";

import { useEffect, useState } from "react";
import keyboardData from "@/data/keyboardMapping.json";

interface HandsDisplayProps {
  currentKey: string;
}

export default function HandsDisplay({ currentKey }: HandsDisplayProps) {
  const [activeFinger, setActiveFinger] = useState<string>("");

  useEffect(() => {
    if (currentKey) {
      const keyData = keyboardData.keys.find(
        (k) => k.key.toLowerCase() === currentKey.toLowerCase()
      );
      if (keyData) {
        setActiveFinger(keyData.finger);
      }
    } else {
      setActiveFinger("");
    }
  }, [currentKey]);

  const getFingerColor = (finger: string) => {
    if (activeFinger === finger) {
      return "#60A5FA"; // Blue highlight
    }

    // Default colors based on finger type - subtle pastels
    const colorMap: Record<string, string> = {
      "left-pinky": "#FFF1F2",
      "left-ring": "#F5F3FF",
      "left-middle": "#F0F9FF",
      "left-index": "#F0FDF4",
      "left-thumb": "#F9FAFB",
      "right-thumb": "#F9FAFB",
      "right-index": "#F0FDF4",
      "right-middle": "#F0F9FF",
      "right-ring": "#F5F3FF",
      "right-pinky": "#FFF1F2",
    };

    return colorMap[finger] || "#F3F4F6";
  };

  return (
    <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
      <div className="flex justify-center items-center gap-16">
        {/* Left Hand */}
        <svg
          width="200"
          height="300"
          viewBox="0 0 200 300"
          className="transition-all duration-300"
        >
          {/* Palm */}
          <ellipse
            cx="100"
            cy="200"
            rx="60"
            ry="80"
            fill="#f3f4f6"
            stroke="#9ca3af"
            strokeWidth="2"
          />

          {/* Pinky */}
          <rect
            x="20"
            y="80"
            width="25"
            height="120"
            rx="12"
            fill={getFingerColor("left-pinky")}
            stroke="#9ca3af"
            strokeWidth="2"
            className="transition-all duration-200"
            style={{
              transform: activeFinger === "left-pinky" ? "translateY(-10px)" : "translateY(0)",
            }}
          />

          {/* Ring */}
          <rect
            x="50"
            y="60"
            width="28"
            height="140"
            rx="14"
            fill={getFingerColor("left-ring")}
            stroke="#9ca3af"
            strokeWidth="2"
            className="transition-all duration-200"
            style={{
              transform: activeFinger === "left-ring" ? "translateY(-10px)" : "translateY(0)",
            }}
          />

          {/* Middle */}
          <rect
            x="83"
            y="50"
            width="30"
            height="150"
            rx="15"
            fill={getFingerColor("left-middle")}
            stroke="#9ca3af"
            strokeWidth="2"
            className="transition-all duration-200"
            style={{
              transform: activeFinger === "left-middle" ? "translateY(-10px)" : "translateY(0)",
            }}
          />

          {/* Index */}
          <rect
            x="118"
            y="60"
            width="28"
            height="140"
            rx="14"
            fill={getFingerColor("left-index")}
            stroke="#9ca3af"
            strokeWidth="2"
            className="transition-all duration-200"
            style={{
              transform: activeFinger === "left-index" ? "translateY(-10px)" : "translateY(0)",
            }}
          />

          {/* Thumb */}
          <ellipse
            cx="155"
            cy="220"
            rx="20"
            ry="35"
            fill={getFingerColor("left-thumb")}
            stroke="#9ca3af"
            strokeWidth="2"
            transform="rotate(45 155 220)"
            className="transition-all duration-200"
            style={{
              transform: activeFinger === "left-thumb" ? "rotate(45deg) scale(1.1)" : "rotate(45deg) scale(1)",
              transformOrigin: "155px 220px",
            }}
          />

          <text x="100" y="280" textAnchor="middle" className="text-sm fill-gray-400 font-light">
            Left
          </text>
        </svg>

        {/* Right Hand */}
        <svg
          width="200"
          height="300"
          viewBox="0 0 200 300"
          className="transition-all duration-300"
        >
          {/* Palm */}
          <ellipse
            cx="100"
            cy="200"
            rx="60"
            ry="80"
            fill="#f3f4f6"
            stroke="#9ca3af"
            strokeWidth="2"
          />

          {/* Index */}
          <rect
            x="54"
            y="60"
            width="28"
            height="140"
            rx="14"
            fill={getFingerColor("right-index")}
            stroke="#9ca3af"
            strokeWidth="2"
            className="transition-all duration-200"
            style={{
              transform: activeFinger === "right-index" ? "translateY(-10px)" : "translateY(0)",
            }}
          />

          {/* Middle */}
          <rect
            x="87"
            y="50"
            width="30"
            height="150"
            rx="15"
            fill={getFingerColor("right-middle")}
            stroke="#9ca3af"
            strokeWidth="2"
            className="transition-all duration-200"
            style={{
              transform: activeFinger === "right-middle" ? "translateY(-10px)" : "translateY(0)",
            }}
          />

          {/* Ring */}
          <rect
            x="122"
            y="60"
            width="28"
            height="140"
            rx="14"
            fill={getFingerColor("right-ring")}
            stroke="#9ca3af"
            strokeWidth="2"
            className="transition-all duration-200"
            style={{
              transform: activeFinger === "right-ring" ? "translateY(-10px)" : "translateY(0)",
            }}
          />

          {/* Pinky */}
          <rect
            x="155"
            y="80"
            width="25"
            height="120"
            rx="12"
            fill={getFingerColor("right-pinky")}
            stroke="#9ca3af"
            strokeWidth="2"
            className="transition-all duration-200"
            style={{
              transform: activeFinger === "right-pinky" ? "translateY(-10px)" : "translateY(0)",
            }}
          />

          {/* Thumb */}
          <ellipse
            cx="45"
            cy="220"
            rx="20"
            ry="35"
            fill={getFingerColor("right-thumb")}
            stroke="#9ca3af"
            strokeWidth="2"
            transform="rotate(-45 45 220)"
            className="transition-all duration-200"
            style={{
              transform: activeFinger === "right-thumb" ? "rotate(-45deg) scale(1.1)" : "rotate(-45deg) scale(1)",
              transformOrigin: "45px 220px",
            }}
          />

          <text x="100" y="280" textAnchor="middle" className="text-sm fill-gray-400 font-light">
            Right
          </text>
        </svg>
      </div>
    </div>
  );
}
