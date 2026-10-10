class SoundController {
  constructor() {
    this.ctx = null;
    this.sfxEnabled = true;
    this.bgmEnabled = true;
    this.bgmPlaying = false;
    this.bgmIntervalId = null;
    this.bgmStepIndex = 0;
    this.bgmMasterGain = null;

    try {
      const savedSfx = localStorage.getItem('egd_sound_enabled');
      if (savedSfx !== null) {
        this.sfxEnabled = savedSfx === 'true';
      }
      const savedBgm = localStorage.getItem('egd_bgm_enabled');
      if (savedBgm !== null) {
        this.bgmEnabled = savedBgm === 'true';
      }
    } catch {
      this.sfxEnabled = true;
      this.bgmEnabled = true;
    }
  }

  ensureAudioContext() {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // --- SOUND FX (HIỆU ỨNG ÂM THANH) ---

  isEnabled() {
    return this.sfxEnabled;
  }

  setEnabled(val) {
    this.sfxEnabled = Boolean(val);
    try {
      localStorage.setItem('egd_sound_enabled', String(this.sfxEnabled));
    } catch {
      // Ignore storage error
    }
  }

  getSfxContext() {
    if (!this.sfxEnabled) return null;
    return this.ensureAudioContext();
  }

  // --- BACKGROUND AMBIANCE (NHẠC NỀN ĐỘC LẬP) ---

  isBgmEnabled() {
    return this.bgmEnabled;
  }

  setBgmEnabled(val) {
    this.bgmEnabled = Boolean(val);
    try {
      localStorage.setItem('egd_bgm_enabled', String(this.bgmEnabled));
    } catch {
      // Ignore storage error
    }

    if (this.bgmEnabled) {
      this.startBgm();
    } else {
      this.stopBgm();
    }
  }

  startBgm() {
    if (!this.bgmEnabled) return;
    if (this.bgmPlaying && this.bgmIntervalId !== null) {
      const ctx = this.ensureAudioContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      return;
    }

    const ctx = this.ensureAudioContext();
    if (!ctx) return;

    this.stopBgm();
    this.bgmPlaying = true;

    const master = ctx.createGain();
    master.gain.setValueAtTime(0.055, ctx.currentTime);
    master.connect(ctx.destination);
    this.bgmMasterGain = master;

    const progression = [
      { pad: [130.81, 196.0], melody: [523.25, 659.25, 783.99, 659.25] },
      { pad: [110.0, 164.81], melody: [440.0, 523.25, 659.25, 587.33] },
      { pad: [174.61, 261.63], melody: [349.23, 440.0, 523.25, 659.25] },
      { pad: [196.0, 293.66], melody: [392.0, 493.88, 587.33, 523.25] },
    ];

    const playAmbientStep = () => {
      if (
        !this.bgmEnabled ||
        !this.bgmPlaying ||
        !this.ctx ||
        !this.bgmMasterGain
      ) {
        return;
      }
      if (this.ctx.state === 'suspended') {
        return;
      }

      const now = this.ctx.currentTime;
      const barIndex = Math.floor(this.bgmStepIndex / 4) % progression.length;
      const beatInBar = this.bgmStepIndex % 4;
      const currentBar = progression[barIndex];

      if (beatInBar === 0) {
        currentBar.pad.forEach((freq) => {
          if (!this.ctx || !this.bgmMasterGain) return;
          const padOsc = this.ctx.createOscillator();
          const padGain = this.ctx.createGain();
          padOsc.type = 'sine';
          padOsc.frequency.setValueAtTime(freq, now);

          padGain.gain.setValueAtTime(0.001, now);
          padGain.gain.linearRampToValueAtTime(0.28, now + 0.6);
          padGain.gain.exponentialRampToValueAtTime(0.001, now + 3.1);

          padOsc.connect(padGain);
          padGain.connect(this.bgmMasterGain);
          padOsc.start(now);
          padOsc.stop(now + 3.15);
        });
      }

      const noteFreq = currentBar.melody[beatInBar];
      if (noteFreq) {
        const noteOsc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();
        noteOsc.type = 'triangle';
        noteOsc.frequency.setValueAtTime(noteFreq, now);

        noteGain.gain.setValueAtTime(0.001, now);
        noteGain.gain.linearRampToValueAtTime(0.22, now + 0.05);
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + 0.72);

        noteOsc.connect(noteGain);
        noteGain.connect(this.bgmMasterGain);
        noteOsc.start(now);
        noteOsc.stop(now + 0.75);
      }

      this.bgmStepIndex = (this.bgmStepIndex + 1) % (progression.length * 4);
    };

    playAmbientStep();
    this.bgmIntervalId = window.setInterval(playAmbientStep, 800);
  }

  stopBgm() {
    this.bgmPlaying = false;
    if (this.bgmIntervalId !== null) {
      window.clearInterval(this.bgmIntervalId);
      this.bgmIntervalId = null;
    }
    if (this.bgmMasterGain && this.ctx) {
      try {
        this.bgmMasterGain.gain.setTargetAtTime(
          0.0001,
          this.ctx.currentTime,
          0.05
        );
      } catch {
        // Ignore
      }
      this.bgmMasterGain = null;
    }
  }

  // --- CÁC HIỆU ỨNG ÂM THANH (SFX) ---

  playJump() {
    const ctx = this.getSfxContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(580, now + 0.14);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  playCorrect() {
    const ctx = this.getSfxContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);
      gain.gain.setValueAtTime(0.12, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.16);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.16);
    });
  }

  playWrong() {
    const ctx = this.getSfxContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.linearRampToValueAtTime(110, now + 0.28);
    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  }

  playMilestonePass() {
    const ctx = this.getSfxContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      gain.gain.setValueAtTime(0.15, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.24);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.24);
    });
  }

  playClick() {
    const ctx = this.getSfxContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(480, now);
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.05);
  }
}

export const soundFX = new SoundController();
