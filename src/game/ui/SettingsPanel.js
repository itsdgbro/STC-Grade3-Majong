import Phaser from 'phaser';
import { Theme } from '../utils/Theme';
import { ModalBox } from './ModalBox';
import { Button } from './Button';
import { IconButton } from './IconButton';
import { Slider } from './Slider';
import { audioManager } from '../services/AudioManager';

/**
 * Standard Settings Panel modal scaled up by 20% with larger interactive elements and sliders
 */
export class SettingsPanel extends ModalBox {
  constructor(scene, onClose = null) {
    // 720x560 + 20% -> 860x670
    super(scene, 'Game Settings', 860, 670, onClose);

    const sliderCenterX = 75;

    // --- SFX Volume Control Section ---
    const sfxLabel = scene.add.text(sliderCenterX, -170, 'Sound Effects (SFX)', {
      fontFamily: Theme.FONTS.TITLE,
      fontSize: '32px',
      fontStyle: 'bold',
      color: '#0369a1',
      align: 'center'
    }).setOrigin(0.5);
    this.content.add(sfxLabel);

    // Left-side SFX Toggle Button (Larger: 64px)
    this.sfxToggleBtn = new IconButton(scene, -280, -115, audioManager.sfxMuted ? '🔇' : '🔊', {
      size: 64,
      bgColor: audioManager.sfxMuted ? 0xfee2e2 : 0xf0fdf4,
      onClick: () => {
        const muted = audioManager.toggleSfxMute();
        this.sfxToggleBtn.setIcon(muted ? '🔇' : '🔊');
        this.sfxToggleBtn.bg.clear();
        this.sfxToggleBtn.bg.fillStyle(muted ? 0xfee2e2 : 0xf0fdf4, 1);
        this.sfxToggleBtn.bg.fillCircle(0, 0, 32);
        this.sfxToggleBtn.bg.lineStyle(3, muted ? Theme.COLORS.ERROR : Theme.COLORS.SUCCESS, 1);
        this.sfxToggleBtn.bg.strokeCircle(0, 0, 32);
      }
    });
    this.content.add(this.sfxToggleBtn);

    // SFX Slider (Larger: 460px width, 18px height, knobRadius 20)
    this.sfxSlider = new Slider(scene, sliderCenterX, -115, {
      width: 460,
      height: 18,
      knobRadius: 20,
      value: audioManager.sfxVolume,
      fillColor: Theme.COLORS.PRIMARY,
      onChange: (val) => {
        audioManager.setSfxVolume(val);
        if (audioManager.sfxMuted) {
          audioManager.toggleSfxMute();
          this.sfxToggleBtn.setIcon('🔊');
        }
      }
    });
    this.content.add(this.sfxSlider);

    // --- Music Volume Control Section ---
    const musicLabel = scene.add.text(sliderCenterX, -20, 'Background Music', {
      fontFamily: Theme.FONTS.TITLE,
      fontSize: '32px',
      fontStyle: 'bold',
      color: '#0369a1',
      align: 'center'
    }).setOrigin(0.5);
    this.content.add(musicLabel);

    // Left-side Music Toggle Button (Larger: 64px)
    this.musicToggleBtn = new IconButton(scene, -280, 35, audioManager.musicMuted ? '🔇' : '🎵', {
      size: 64,
      bgColor: audioManager.musicMuted ? 0xfee2e2 : 0xf0fdf4,
      onClick: () => {
        const muted = audioManager.toggleMusicMute();
        this.musicToggleBtn.setIcon(muted ? '🔇' : '🎵');
        this.musicToggleBtn.bg.clear();
        this.musicToggleBtn.bg.fillStyle(muted ? 0xfee2e2 : 0xf0fdf4, 1);
        this.musicToggleBtn.bg.fillCircle(0, 0, 32);
        this.musicToggleBtn.bg.lineStyle(3, muted ? Theme.COLORS.ERROR : Theme.COLORS.SUCCESS, 1);
        this.musicToggleBtn.bg.strokeCircle(0, 0, 32);
      }
    });
    this.content.add(this.musicToggleBtn);

    // Music Slider (Larger: 460px width, 18px height, knobRadius 20)
    this.musicSlider = new Slider(scene, sliderCenterX, 35, {
      width: 460,
      height: 18,
      knobRadius: 20,
      value: audioManager.musicVolume,
      fillColor: Theme.COLORS.SECONDARY,
      onChange: (val) => {
        audioManager.setMusicVolume(val);
        if (audioManager.musicMuted) {
          audioManager.toggleMusicMute();
          this.musicToggleBtn.setIcon('🎵');
        }
      }
    });
    this.content.add(this.musicSlider);

    this.show();
  }
}
