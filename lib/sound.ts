let audioContext: AudioContext | null = null;

function ensureContext() {
  if (typeof window === "undefined") return null;
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}

export function playKeySound(type: "correct" | "incorrect" | "complete") {
  const ctx = ensureContext();
  if (!ctx) return;

  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.type = type === "incorrect" ? "sawtooth" : "sine";
  oscillator.frequency.value = type === "complete" ? 540 : type === "incorrect" ? 180 : 320;

  gain.gain.value = 0.05;

  oscillator.connect(gain);
  gain.connect(ctx.destination);

  const now = ctx.currentTime;
  oscillator.start(now);
  oscillator.stop(now + (type === "complete" ? 0.3 : 0.15));
}
