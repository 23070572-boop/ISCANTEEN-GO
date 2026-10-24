/**
 * Mobile Haptic & Sound Feedback Utility
 * Web Audio API synthesize (no external audio files required) & navigator.vibrate
 */

class FeedbackManager {
  private audioCtx: AudioContext | null = null;

  private initAudio() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
  }

  // Soft click feedback
  tap() {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(15);
      } catch {
        // ignore
      }
    }
    this.playTone(600, 0.04, 'sine', 0.05);
  }

  // Rule warning feedback (double vibrate + alert tone)
  warning() {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([40, 50, 40]);
      } catch {
        // ignore
      }
    }
    this.playTone(320, 0.12, 'triangle', 0.1);
  }

  // Success celebration (QR scan, Order placed, Payment success)
  success() {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([30, 60, 50, 80, 70]);
      } catch {
        // ignore
      }
    }
    this.playChord([523.25, 659.25, 783.99, 1046.5]); // C Major chord
  }

  private playTone(freq: number, duration: number, type: OscillatorType = 'sine', gainVal = 0.08) {
    try {
      this.initAudio();
      if (!this.audioCtx) return;
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

      gain.gain.setValueAtTime(gainVal, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch {
      // Audio autoplay policy
    }
  }

  private playChord(freqs: number[]) {
    try {
      this.initAudio();
      if (!this.audioCtx) return;
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      const now = this.audioCtx.currentTime;
      freqs.forEach((freq, idx) => {
        if (!this.audioCtx) return;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);

        gain.gain.setValueAtTime(0.09, now + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.35);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.35);
      });
    } catch {
      // fallback
    }
  }
}

export const feedback = new FeedbackManager();
