/**
 * Unified WebAudio & Speech Synthesis Service
 */
class AudioManager {
  constructor() {
    this.ctx = null;
    this.sfxVolume = 0.8;
    this.musicVolume = 0.5;
    this.speechVolume = 0.8;
    this.sfxMuted = false;
    this.musicMuted = false;
    this.speechMuted = false;
    this.isBgmPlaying = false;
    this.bgmTimer = null;
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

  startBGM() {
    if (this.isBgmPlaying || this.musicMuted || this.musicVolume === 0) return;
    this.initContext();
    if (!this.ctx) return;
    this.isBgmPlaying = true;

    const scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25];
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

          osc.start();
          osc.stop(this.ctx.currentTime + 1.9);
        } catch (_) {}
      }

      const nextDelay = 1200 + Math.random() * 1000;
      this.bgmTimer = setTimeout(scheduleNextNote, nextDelay);
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

  playTileSelect() {
    this.playTone(523.25, 0.08, 'sine', 0.08); // C5
  }

  playTileMatch() {
    this.playArpeggio([523.25, 659.25, 783.99, 1046.50], 0.08, 'triangle', 0.18);
  }

  playMismatch() {
    this.playTone(220, 0.22, 'sawtooth', 0.09);
  }

  playHint() {
    this.playArpeggio([440, 554.37, 659.25, 880], 0.06, 'sine', 0.12);
  }

  playRoundComplete() {
    this.playArpeggio([392, 523.25, 659.25, 783.99, 1046.50, 1318.51], 0.1, 'sine', 0.22);
  }

  playVictory() {
    this.playArpeggio([261.63, 329.63, 392, 523.25, 659.25, 783.99, 1046.50], 0.12, 'sine', 0.3);
  }

  playButtonPress() {
    this.playTone(600, 0.04, 'sine', 0.08);
  }

  playTone(frequency, duration, type = 'sine', volumeScale = 0.1) {
    const vol = this.getEffectiveSfxVolume();
    if (vol <= 0) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(vol * volumeScale, this.ctx.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration + 0.05);
    } catch (_) {}
  }

  playArpeggio(notes, noteDuration, type = 'sine', volumeScale = 0.15) {
    const vol = this.getEffectiveSfxVolume();
    if (vol <= 0) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      notes.forEach((freq, idx) => {
        const start = this.ctx.currentTime + idx * noteDuration;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.001, start);
        gain.gain.linearRampToValueAtTime(vol * volumeScale, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + noteDuration * 2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(start);
        osc.stop(start + noteDuration * 2.2);
      });
    } catch (_) {}
  }

  speak(text) {
    // TTS disabled per user preference
    return;
  }
}

export const audioManager = new AudioManager();
