// Web Audio API Synthesizer for Mystical Sound Effects

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Plays a crystalline mystical chime sound effect when flipping a card.
 */
export function playMysticalChimeSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Harmonic frequencies for a celestial/mystical chime (C6, E6, G6, C7, E7)
    const notes = [
      { freq: 1046.50, delay: 0, gain: 0.12, duration: 1.4 },    // C6
      { freq: 1318.51, delay: 0.04, gain: 0.10, duration: 1.6 }, // E6
      { freq: 1567.98, delay: 0.08, gain: 0.09, duration: 1.8 }, // G6
      { freq: 2093.00, delay: 0.14, gain: 0.11, duration: 2.0 }, // C7
      { freq: 2637.02, delay: 0.22, gain: 0.07, duration: 2.2 }, // E7
    ];

    // Master bus
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.7, now);
    masterGain.connect(ctx.destination);

    notes.forEach(({ freq, delay, gain, duration }) => {
      const startTime = now + delay;

      // Oscillator
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();

      // Sine wave with soft triangle overtone for crystalline chime timbre
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      // Subtle pitch bend upwards for magical shimmer
      osc.frequency.exponentialRampToValueAtTime(freq * 1.008, startTime + duration);

      // Envelope: Instant attack, gentle exponential decay
      noteGain.gain.setValueAtTime(0, startTime);
      noteGain.gain.linearRampToValueAtTime(gain, startTime + 0.015);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(noteGain);
      noteGain.connect(masterGain);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.1);
    });
  } catch (e) {
    console.warn('Audio play failure:', e);
  }
}
