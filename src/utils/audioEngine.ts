/**
 * Dual-mode romantic wedding audio engine:
 * 1) Plays custom MP3 URL if configured
 * 2) Falls back seamlessly to a warm Web Audio API Javanese Pelog-inspired acoustic synthesizer
 */
class WeddingAudioEngine {
  private audioEl: HTMLAudioElement | null = null;
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private loopTimer: number | null = null;
  private playing = false;
  private customUrl = '';
  private audioSrcKey = '';
  private step = 0;

  // Pelog-inspired romantic Javanese pentatonic scale (Hz: D4, Eb4, F4, A4, Bb4, D5, Eb5, F5)
  private readonly melodyNotes = [
    293.66, 349.23, 440.0, 466.16, 440.0, 349.23, 311.13, 293.66,
    440.0, 587.33, 622.25, 587.33, 466.16, 440.0, 349.23, 293.66,
  ];
  private readonly bassNotes = [146.83, 146.83, 174.61, 174.61, 116.54, 116.54, 146.83, 146.83];

  public isPlaying(): boolean {
    return this.playing;
  }

  public setCustomUrl(url: string) {
    const trimmed = url.trim();
    if (trimmed === this.customUrl) return;
    const wasPlaying = this.playing;
    this.stop();
    this.customUrl = trimmed;
    this.audioEl = null;
    this.audioSrcKey = '';
    if (wasPlaying) {
      void this.play();
    }
  }

  public async play(): Promise<boolean> {
    if (this.playing) return true;

    if (this.customUrl) {
      try {
        if (!this.audioEl || this.audioSrcKey !== this.customUrl) {
          this.audioEl = new Audio(this.customUrl);
          this.audioEl.preload = 'auto';
          this.audioEl.loop = true;
          this.audioEl.volume = 0.65;
          this.audioSrcKey = this.customUrl;
        }
        await this.audioEl.play();
        this.playing = true;
        return true;
      } catch {
        // Fallback to built-in Javanese instrumental synthesizer
        this.audioEl = null;
        this.audioSrcKey = '';
      }
    }

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!this.ctx) {
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      this.masterGain.gain.exponentialRampToValueAtTime(0.18, this.ctx.currentTime + 1.2);
      this.masterGain.connect(this.ctx.destination);

      this.playing = true;
      this.scheduleStep();
      this.loopTimer = window.setInterval(() => {
        if (this.playing) {
          this.scheduleStep();
        }
      }, 950);
      return true;
    } catch {
      this.playing = false;
      return false;
    }
  }

  private scheduleStep() {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const freq = this.melodyNotes[this.step % this.melodyNotes.length];

    // Siter / harp-like warm plucked voice
    const osc = this.ctx.createOscillator();
    const noteGain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1600, now);
    filter.frequency.exponentialRampToValueAtTime(480, now + 1.4);

    noteGain.gain.setValueAtTime(0.001, now);
    noteGain.gain.linearRampToValueAtTime(0.32, now + 0.04);
    noteGain.gain.exponentialRampToValueAtTime(0.001, now + 1.75);

    osc.connect(filter);
    filter.connect(noteGain);
    noteGain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 1.8);

    // Gentle Gong / Kempul bass every 2 beats
    if (this.step % 2 === 0) {
      const bassFreq = this.bassNotes[(this.step / 2) % this.bassNotes.length];
      const bassOsc = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();

      bassOsc.type = 'sine';
      bassOsc.frequency.setValueAtTime(bassFreq, now);

      bassGain.gain.setValueAtTime(0.001, now);
      bassGain.gain.linearRampToValueAtTime(0.28, now + 0.12);
      bassGain.gain.exponentialRampToValueAtTime(0.001, now + 2.4);

      bassOsc.connect(bassGain);
      bassGain.connect(this.masterGain);

      bassOsc.start(now);
      bassOsc.stop(now + 2.5);
    }

    this.step += 1;
  }

  public pause() {
    this.playing = false;
    if (this.audioEl) {
      this.audioEl.pause();
    }
    if (this.loopTimer !== null) {
      window.clearInterval(this.loopTimer);
      this.loopTimer = null;
    }
    if (this.masterGain && this.ctx) {
      try {
        this.masterGain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.15);
      } catch {
        // Ignore gain scheduling errors when context closes
      }
    }
  }

  public stop() {
    this.pause();
    if (this.audioEl) {
      this.audioEl.currentTime = 0;
    }
  }

  public async toggle(): Promise<boolean> {
    if (this.playing) {
      this.pause();
      return false;
    }
    return this.play();
  }
}

export const weddingAudio = new WeddingAudioEngine();
