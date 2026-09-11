// Synthesizes playful, gentle sound effects and background music using Web Audio API
// and speaks vocabulary words using Web Speech Synthesis API.

class AudioManager {
  constructor() {
    this.ctx = null;
    this.sfxVolume = 0.8;
    this.musicVolume = 0.5;
    this.speechVolume = 0.7;
    this.sfxMuted = false;
    this.musicMuted = false;
    this.speechMuted = false;

    // Background music nodes
    this.bgmTimer = null;
    this.isBgmPlaying = false;
  }

  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  getEffectiveSfxVolume() {
    return this.sfxMuted ? 0 : this.sfxVolume;
  }

  getEffectiveMusicVolume() {
    return this.musicMuted ? 0 : this.musicVolume;
  }

  setSfxVolume(val) {
    this.sfxVolume = Math.max(0, Math.min(1, val));
    if (this.sfxVolume > 0) this.sfxMuted = false;
    this.speechVolume = this.sfxVolume;
    this.speechMuted = this.sfxMuted;
  }

  setMusicVolume(val) {
    this.musicVolume = Math.max(0, Math.min(1, val));
    if (this.musicVolume > 0) this.musicMuted = false;
  }

  setSpeechVolume(val) {
    this.speechVolume = Math.max(0, Math.min(1, val));
    if (this.speechVolume > 0) this.speechMuted = false;
  }

  toggleSfxMute() {
    this.sfxMuted = !this.sfxMuted;
    this.speechMuted = this.sfxMuted;
    return this.sfxMuted;
  }

  toggleMusicMute() {
    this.musicMuted = !this.musicMuted;
    if (this.musicMuted) {
      this.stopBGM();
    } else {
      this.startBGM();
    }
    return this.musicMuted;
  }

  toggleSpeechMute() {
    this.speechMuted = !this.speechMuted;
    return this.speechMuted;
  }

  // --- Background Ambient Music (Gentle Himalayan Pentatonic Chimes) ---
  startBGM() {
    if (this.isBgmPlaying || this.musicMuted || this.musicVolume === 0) return;
    this.initContext();
    if (!this.ctx) return;
    this.isBgmPlaying = true;

    const scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25]; // C D E G A C D E
    let noteIdx = 0;

    const scheduleNextNote = () => {
      if (!this.isBgmPlaying) return;
      const vol = this.getEffectiveMusicVolume();
      if (vol > 0 && this.ctx) {
        try {
          const freq = scale[noteIdx % scale.length];
          noteIdx = (noteIdx + Math.floor(Math.random() * 3) + 1) % scale.length;

          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

          gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
          gain.gain.linearRampToValueAtTime(0.08 * vol, this.ctx.currentTime + 0.15);
          gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1.8);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(this.ctx.currentTime);
          osc.stop(this.ctx.currentTime + 1.9);
        } catch (e) {
          // Context suspended or inactive
        }
      }

      const delay = 1200 + Math.random() * 800;
      this.bgmTimer = setTimeout(scheduleNextNote, delay);
    };

    scheduleNextNote();
  }

  stopBGM() {
    this.isBgmPlaying = false;
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  // --- Sound Effects ---
  playSelect() {
    const vol = this.getEffectiveSfxVolume();
    if (vol <= 0) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(780, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.2 * vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } catch (e) {
      console.warn(e);
    }
  }

  playMatch() {
    const vol = this.getEffectiveSfxVolume();
    if (vol <= 0) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.06);

        gain.gain.setValueAtTime(0.001, this.ctx.currentTime + idx * 0.06);
        gain.gain.linearRampToValueAtTime(0.25 * vol, this.ctx.currentTime + idx * 0.06 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.06 + 0.28);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + idx * 0.06);
        osc.stop(this.ctx.currentTime + idx * 0.06 + 0.3);
      });
    } catch (e) {
      console.warn(e);
    }
  }

  playMismatch() {
    const vol = this.getEffectiveSfxVolume();
    if (vol <= 0) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(240, this.ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.18 * vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.2);
    } catch (e) {
      console.warn(e);
    }
  }

  playHeartLost() {
    const vol = this.getEffectiveSfxVolume();
    if (vol <= 0) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      // Rapid downward double blip indicating lost heart
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(360, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, this.ctx.currentTime + 0.25);

      gain.gain.setValueAtTime(0.2 * vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.26);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.26);
    } catch (e) {
      console.warn(e);
    }
  }

  playGameOver() {
    const vol = this.getEffectiveSfxVolume();
    if (vol <= 0) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      // Gentle descending 4-note chime for encouraging game over
      const notes = [
        { f: 392.00, d: 0.2, t: 0 },    // G4
        { f: 349.23, d: 0.2, t: 0.22 }, // F4
        { f: 329.63, d: 0.2, t: 0.44 }, // E4
        { f: 261.63, d: 0.5, t: 0.66 }  // C4
      ];

      notes.forEach(({ f, d, t }) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, this.ctx.currentTime + t);

        gain.gain.setValueAtTime(0.001, this.ctx.currentTime + t);
        gain.gain.linearRampToValueAtTime(0.22 * vol, this.ctx.currentTime + t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + t + d);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + t);
        osc.stop(this.ctx.currentTime + t + d);
      });
    } catch (e) {
      console.warn(e);
    }
  }

  playHint() {
    const vol = this.getEffectiveSfxVolume();
    if (vol <= 0) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.18);

      gain.gain.setValueAtTime(0.2 * vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.22);
    } catch (e) {
      console.warn(e);
    }
  }

  playShuffle() {
    const vol = this.getEffectiveSfxVolume();
    if (vol <= 0) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      for (let i = 0; i < 5; i++) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400 + Math.random() * 300, this.ctx.currentTime + i * 0.04);
        gain.gain.setValueAtTime(0.1 * vol, this.ctx.currentTime + i * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.04 + 0.08);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + i * 0.04);
        osc.stop(this.ctx.currentTime + i * 0.04 + 0.09);
      }
    } catch (e) {
      console.warn(e);
    }
  }

  playFanfare() {
    const vol = this.getEffectiveSfxVolume();
    if (vol <= 0) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const melody = [
        { f: 523.25, d: 0.12, t: 0 },
        { f: 659.25, d: 0.12, t: 0.12 },
        { f: 783.99, d: 0.12, t: 0.24 },
        { f: 1046.5, d: 0.35, t: 0.36 },
        { f: 880.00, d: 0.12, t: 0.72 },
        { f: 1046.5, d: 0.5,  t: 0.84 }
      ];

      melody.forEach(({ f, d, t }) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, this.ctx.currentTime + t);

        gain.gain.setValueAtTime(0.001, this.ctx.currentTime + t);
        gain.gain.linearRampToValueAtTime(0.28 * vol, this.ctx.currentTime + t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + t + d);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + t);
        osc.stop(this.ctx.currentTime + t + d);
      });
    } catch (e) {
      console.warn(e);
    }
  }

  speakWord(word) {
    // TTS disabled per user preference
    return;
  }
}

export const audio = new AudioManager();
