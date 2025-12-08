"use client";

import { useState, useEffect, useRef } from "react";
import { getSoundManager, type SoundProfile, type SoundSettings as SoundSettingsType } from "@/utils/sounds";

interface SoundSettingsProps {
  onSettingsChange?: () => void;
}

interface MusicSettings {
  enabled: boolean;
  trackId: string;
  volume: number;
}

const MUSIC_TRACKS = [
  {
    id: "lofi-vibes",
    title: "Lofi Vibes",
    artist: "Pixabay",
    url: "https://cdn.pixabay.com/download/audio/2022/10/23/audio_9d869651379343fcde798e9b9aee2343.mp3?filename=mellow-ambient-120111.mp3",
  },
  {
    id: "calm-focus",
    title: "Calm Focus",
    artist: "Pixabay",
    url: "https://cdn.pixabay.com/download/audio/2021/10/25/audio_a4704724c9.mp3?filename=calm-meditation-11157.mp3",
  },
  {
    id: "night-keys",
    title: "Night Keys",
    artist: "Pixabay",
    url: "https://cdn.pixabay.com/download/audio/2022/03/08/audio_7d8ba123b3.mp3?filename=still-awake-105868.mp3",
  },
];

const DEFAULT_MUSIC_SETTINGS: MusicSettings = {
  enabled: false,
  trackId: MUSIC_TRACKS[0].id,
  volume: 0.2,
};

export default function SoundSettings({ onSettingsChange }: SoundSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<SoundSettingsType>({
    profile: "classic",
    volume: 0.3,
    enabled: true,
  });
  const [musicSettings, setMusicSettings] = useState<MusicSettings>(DEFAULT_MUSIC_SETTINGS);
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const soundManagerRef = useRef<ReturnType<typeof getSoundManager> | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!soundManagerRef.current) {
      soundManagerRef.current = getSoundManager();
      setSettings(soundManagerRef.current.getSettings());
    }

    const saved = localStorage.getItem("typingSoundSettings");
    if (saved && soundManagerRef.current) {
      const parsed = JSON.parse(saved);
      soundManagerRef.current.setSettings(parsed);
      setSettings(soundManagerRef.current.getSettings());
    }
    const savedMusic = localStorage.getItem("typingMusicSettings");
    if (savedMusic) {
      try {
        const parsedMusic = JSON.parse(savedMusic);
        setMusicSettings({ ...DEFAULT_MUSIC_SETTINGS, ...parsedMusic });
      } catch (err) {
        console.warn("Invalid music settings", err);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!musicRef.current) {
      musicRef.current = new Audio();
      musicRef.current.loop = true;
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const audio = musicRef.current;
    if (!audio) return;
    localStorage.setItem("typingMusicSettings", JSON.stringify(musicSettings));
    const track = MUSIC_TRACKS.find((t) => t.id === musicSettings.trackId);
    if (track) {
      if (audio.src !== track.url) {
        audio.src = track.url;
      }
    }
    audio.volume = musicSettings.volume;
    if (musicSettings.enabled && track) {
      audio.play().catch(() => {
        // Autoplay might be blocked until user interacts; ignore errors.
      });
    } else {
      audio.pause();
    }
  }, [musicSettings]);

  const handleProfileChange = (profile: SoundProfile) => {
    const newSettings = { ...settings, profile };
    setSettings(newSettings);
    if (soundManagerRef.current) {
      soundManagerRef.current.setSettings(newSettings);
      if (profile !== "none") {
        soundManagerRef.current.playKeyPress();
      }
    }
    localStorage.setItem("typingSoundSettings", JSON.stringify(newSettings));
    onSettingsChange?.();
  };

  const handleVolumeChange = (volume: number) => {
    const newSettings = { ...settings, volume };
    setSettings(newSettings);
    if (soundManagerRef.current) {
      soundManagerRef.current.setSettings(newSettings);
    }
    localStorage.setItem("typingSoundSettings", JSON.stringify(newSettings));
    onSettingsChange?.();
  };

  const handleEnabledToggle = () => {
    const newSettings = { ...settings, enabled: !settings.enabled };
    setSettings(newSettings);
    if (soundManagerRef.current) {
      soundManagerRef.current.setSettings(newSettings);
    }
    localStorage.setItem("typingSoundSettings", JSON.stringify(newSettings));
    onSettingsChange?.();
  };

  const toggleMusic = () => {
    setMusicSettings((prev) => ({ ...prev, enabled: !prev.enabled }));
  };

  const handleMusicVolume = (value: number) => {
    setMusicSettings((prev) => ({ ...prev, volume: value }));
  };

  const handleTrackSelect = (trackId: string) => {
    setMusicSettings((prev) => ({ ...prev, trackId, enabled: true }));
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
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-2xl shadow-xl z-20 p-6 space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Audio Settings</h3>

            <div className="flex items-center justify-between">
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

            <div>
              <label className="text-sm font-medium text-gray-700 mb-3 block">Sound Profile</label>
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
                    <div className="font-medium text-sm text-gray-900">{profile.label}</div>
                    <div className="text-xs text-gray-500">{profile.description}</div>
                  </button>
                ))}
              </div>
            </div>

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

            <div className="border-t border-gray-100 pt-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-sm font-medium text-gray-700">Background Music</span>
                  <p className="text-xs text-gray-500">Lo-fi ambience for focus</p>
                </div>
                <button
                  onClick={toggleMusic}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    musicSettings.enabled ? "bg-purple-500" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      musicSettings.enabled ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
              <div className="space-y-2 mb-3">
                {MUSIC_TRACKS.map((track) => (
                  <button
                    key={track.id}
                    className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${
                      musicSettings.trackId === track.id
                        ? "border-purple-400 bg-purple-50"
                        : "border-gray-200 bg-white hover:bg-gray-50"
                    } ${!musicSettings.enabled ? "opacity-70" : ""}`}
                    onClick={() => handleTrackSelect(track.id)}
                  >
                    <div className="font-semibold text-gray-900">{track.title}</div>
                    <div className="text-xs text-gray-500">{track.artist}</div>
                  </button>
                ))}
              </div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Music volume: {Math.round(musicSettings.volume * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={musicSettings.volume * 100}
                onChange={(e) => handleMusicVolume(Number(e.target.value) / 100)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
