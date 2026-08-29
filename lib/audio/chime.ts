"use client";

// Synthesized via Web Audio — no asset files to ship or fetch, and no
// autoplay-policy risk since these only ever fire once the user is already
// inside an active (user-gesture-started) LiveKit room.
let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioContext) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    audioContext = new Ctor();
  }
  return audioContext;
}

function playNotes(frequencies: number[], noteDuration: number, volume: number) {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === "suspended") ctx.resume().catch(() => {});

  frequencies.forEach((frequency, i) => {
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;

    const startTime = ctx.currentTime + i * noteDuration;
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + noteDuration);

    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(startTime);
    oscillator.stop(startTime + noteDuration + 0.05);
  });
}

/** A short two-note ascending chime — someone joined the session. */
export function playJoinChime() {
  playNotes([523.25, 659.25], 0.14, 0.12); // C5 -> E5
}

/** A short two-note descending chime — someone left the session. */
export function playLeaveChime() {
  playNotes([659.25, 523.25], 0.14, 0.12); // E5 -> C5
}
