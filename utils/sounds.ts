// Sound profiles for different typing experiences
export type SoundProfile = "classic" | "mechanical" | "soft" | "typewriter" | "none";

export interface SoundSettings {
  profile: SoundProfile;
  volume: number;
  enabled: boolean;
}

class TypingSoundManager {
  private audioContext: AudioContext | null = null;
  private settings: SoundSettings = {
    profile: "classic",
    volume: 0.3,
    enabled: true,
  };

  constructor() {
    if (typeof window !== "undefined") {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  setSettings(settings: Partial<SoundSettings>) {
    this.settings = { ...this.settings, ...settings };
  }

  getSettings(): SoundSettings {
    return { ...this.settings };
  }

  playKeyPress() {
    if (!this.settings.enabled || this.settings.profile === "none" || !this.audioContext) {
      return;
    }

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    const now = this.audioContext.currentTime;

    // Different sound profiles
    switch (this.settings.profile) {
      case "classic":
        oscillator.frequency.setValueAtTime(800, now);
        oscillator.frequency.exponentialRampToValueAtTime(400, now + 0.05);
        gainNode.gain.setValueAtTime(this.settings.volume, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        oscillator.start(now);
        oscillator.stop(now + 0.05);
        break;

      case "mechanical":
        oscillator.frequency.setValueAtTime(1200, now);
        oscillator.frequency.exponentialRampToValueAtTime(600, now + 0.03);
        oscillator.type = "square";
        gainNode.gain.setValueAtTime(this.settings.volume * 0.8, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.03);
        oscillator.start(now);
        oscillator.stop(now + 0.03);
        break;

      case "soft":
        oscillator.frequency.setValueAtTime(600, now);
        oscillator.frequency.exponentialRampToValueAtTime(300, now + 0.08);
        oscillator.type = "sine";
        gainNode.gain.setValueAtTime(this.settings.volume * 0.5, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        oscillator.start(now);
        oscillator.stop(now + 0.08);
        break;

      case "typewriter":
        // Double tap for typewriter effect
        const osc1 = this.audioContext.createOscillator();
        const gain1 = this.audioContext.createGain();
        osc1.connect(gain1);
        gain1.connect(this.audioContext.destination);
        osc1.frequency.setValueAtTime(1500, now);
        osc1.type = "square";
        gain1.gain.setValueAtTime(this.settings.volume * 0.6, now);
        gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.02);
        osc1.start(now);
        osc1.stop(now + 0.02);

        // Second tap
        const osc2 = this.audioContext.createOscillator();
        const gain2 = this.audioContext.createGain();
        osc2.connect(gain2);
        gain2.connect(this.audioContext.destination);
        osc2.frequency.setValueAtTime(1000, now + 0.02);
        osc2.type = "square";
        gain2.gain.setValueAtTime(this.settings.volume * 0.4, now + 0.02);
        gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.04);
        osc2.start(now + 0.02);
        osc2.stop(now + 0.04);
        break;
    }
  }

  playError() {
    if (!this.settings.enabled || this.settings.profile === "none" || !this.audioContext) {
      return;
    }

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    const now = this.audioContext.currentTime;

    // Error sound - lower pitched buzz
    oscillator.frequency.setValueAtTime(200, now);
    oscillator.type = "sawtooth";
    gainNode.gain.setValueAtTime(this.settings.volume * 0.4, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    oscillator.start(now);
    oscillator.stop(now + 0.1);
  }

  playComplete() {
    if (!this.settings.enabled || this.settings.profile === "none" || !this.audioContext) {
      return;
    }

    const now = this.audioContext.currentTime;

    // Success chord
    [523.25, 659.25, 783.99].forEach((freq, index) => {
      const oscillator = this.audioContext!.createOscillator();
      const gainNode = this.audioContext!.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext!.destination);

      oscillator.frequency.setValueAtTime(freq, now);
      oscillator.type = "sine";
      gainNode.gain.setValueAtTime(this.settings.volume * 0.3, now + index * 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + index * 0.1 + 0.4);
      oscillator.start(now + index * 0.1);
      oscillator.stop(now + index * 0.1 + 0.4);
    });
  }
}

// Singleton instance
let soundManager: TypingSoundManager | null = null;

export function getSoundManager(): TypingSoundManager {
  if (!soundManager) {
    soundManager = new TypingSoundManager();
  }
  return soundManager;
}
