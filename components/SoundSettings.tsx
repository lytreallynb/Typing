"use client";

import { useState, useEffect } from "react";
import { getSoundManager, type SoundProfile } from "@/utils/sounds";

interface SoundSettingsProps {
  onSettingsChange?: () => void;
}

export default function SoundSettings({ onSettingsChange }: SoundSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const soundManager = getSoundManager();
  const [settings, setSettings] = useState(soundManager.getSettings());

  useEffect(() => {
    // Load settings from localStorage
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("typingSoundSettings");
      if (saved) {
        const parsed = JSON.parse(saved);
        soundManager.setSettings(parsed);
        setSettings(soundManager.getSettings());
      }
    }
  }, []);

  const handleProfileChange = (profile: SoundProfile) => {
    const newSettings = { ...settings, profile };
    setSettings(newSettings);
    soundManager.setSettings(newSettings);
    localStorage.setItem("typingSoundSettings", JSON.stringify(newSettings));

    // Play preview
    if (profile !== "none") {
      soundManager.playKeyPress();
    }

    onSettingsChange?.();
  };

  const handleVolumeChange = (volume: number) => {
    const newSettings = { ...settings, volume };
    setSettings(newSettings);
    soundManager.setSettings(newSettings);
    localStorage.setItem("typingSoundSettings", JSON.stringify(newSettings));
    onSettingsChange?.();
  };

  const handleEnabledToggle = () => {
    const newSettings = { ...settings, enabled: !settings.enabled };
    setSettings(newSettings);
    soundManager.setSettings(newSettings);
    localStorage.setItem("typingSoundSettings", JSON.stringify(newSettings));
    onSettingsChange?.();
  };

  const soundProfiles: { value: SoundProfile; label: string; description: string }[] = [
    { value: "none", label: "None", description: "Silent typing" },
    { value: "classic", label: "Classic", description: "Traditional click sound" },
    { value: "mechanical", label: "Mechanical", description: "Sharp, crisp clicks" },
    { value: "soft", label: "Soft", description: "Gentle, muted tones" },
    { value: "typewriter", label: "Typewriter", description: "Vintage typing feel" },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors flex items-center gap-2"
      >
        <svg
          className="w-5 h-5 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m8.486-12.728a9 9 0 00-12.728 0"
          />
        </svg>
        <span className="text-sm font-medium text-gray-700">Sound</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-2xl shadow-xl z-20 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Sound Settings
            </h3>

            {/* Enable/Disable Toggle */}
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm font-medium text-gray-700">Enable Sounds</span>
              <button
                onClick={handleEnabledToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.enabled ? "bg-blue-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.enabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Sound Profile Selection */}
            <div className="mb-6">
              <label className="text-sm font-medium text-gray-700 mb-3 block">
                Sound Profile
              </label>
              <div className="space-y-2">
                {soundProfiles.map((profile) => (
                  <button
                    key={profile.value}
                    onClick={() => handleProfileChange(profile.value)}
                    disabled={!settings.enabled}
                    className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                      settings.profile === profile.value
                        ? "border-blue-400 bg-blue-50"
                        : "border-gray-200 bg-white hover:bg-gray-50"
                    } ${!settings.enabled ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <div className="font-medium text-sm text-gray-900">
                      {profile.label}
                    </div>
                    <div className="text-xs text-gray-500">
                      {profile.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Volume Control */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-3 block">
                Volume: {Math.round(settings.volume * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.volume * 100}
                onChange={(e) => handleVolumeChange(Number(e.target.value) / 100)}
                disabled={!settings.enabled}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
