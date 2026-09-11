import Phaser from 'phaser';
import { Theme } from '../utils/Theme';
import { UILayers } from '../utils/UILayers';
import { UIPositions } from '../utils/UIPositions';
import { Button } from '../ui/Button';
import { IconButton } from '../ui/IconButton';
import { SettingsPanel } from '../ui/SettingsPanel';
import { ModalBox } from '../ui/ModalBox';
import { audioManager } from '../services/AudioManager';
import { getLoadedGameData } from '../utils/dataLoader';

/**
 * Main Menu Scene for Himalayan Nepali Bingo conforming to project-rules standard UI slots & depths
 */
export class MainMenu extends Phaser.Scene {
  constructor() {
    super('MainMenu');
  }

  create() {
    const width = 1920;
    const height = 1080;

    const gameData = getLoadedGameData();
    const levelInfo = Array.isArray(gameData) ? gameData[0] : (gameData || {});

    const headerBadge = levelInfo?.headerBadge || 'SAVE THE CHILDREN • कक्षा ३ नेपाली';
    const mainTitle = levelInfo?.title || 'नेपाली शब्द बिंगो (Grade 3 Nepali Bingo)';
    const subtitle = levelInfo?.subtitle || 'पाठ १ - २३ (शब्दार्थ, व्याकरण र शब्दावली)';

    // Background Image or Gradient (Layer 0)
    if (this.textures.exists('bg_mountain')) {
      const bg = this.add.image(width / 2, height / 2, 'bg_mountain').setDisplaySize(width, height);
      bg.setDepth(UILayers.GAME_BACKGROUND);
      const overlay = this.add.graphics();
      overlay.fillStyle(0x0284c7, 0.35);
      overlay.fillRect(0, 0, width, height);
      overlay.setDepth(UILayers.GAME_BACKGROUND);
    } else {
      const bg = this.add.graphics();
      bg.fillGradientStyle(0x38bdf8, 0x38bdf8, 0x0284c7, 0x0369a1, 1);
      bg.fillRect(0, 0, width, height);
      bg.setDepth(UILayers.GAME_BACKGROUND);
    }

    // Top Header Badge
    const badge = this.add.graphics();
    badge.fillStyle(0xffffff, 0.95);
    badge.fillRoundedRect(width / 2 - 320, 64, 640, 52, 26);
    badge.lineStyle(2, Theme.COLORS.PRIMARY, 0.3);
    badge.strokeRoundedRect(width / 2 - 320, 64, 640, 52, 26);
    badge.setDepth(UILayers.UI_BACKGROUND_PANELS);

    this.add.text(width / 2, 90, headerBadge, {
      fontFamily: Theme.FONTS.BODY,
      fontSize: '24px',
      fontStyle: 'bold',
      color: '#0369a1',
      padding: { top: 8, bottom: 8, left: 6, right: 6 }
    }).setOrigin(0.5).setDepth(UILayers.UI_TEXT);

    // Title Card Container
    this.add.text(width / 2, 210, mainTitle, {
      fontFamily: Theme.FONTS.TITLE,
      fontSize: '68px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#0369a1',
      strokeThickness: 12,
      shadow: { blur: 14, color: '#000000', fill: true, offsetY: 4 },
      padding: { top: 16, bottom: 16, left: 10, right: 10 }
    }).setOrigin(0.5).setDepth(UILayers.UI_TEXT);

    this.add.text(width / 2, 288, subtitle, {
      fontFamily: Theme.FONTS.BODY,
      fontSize: '32px',
      fontStyle: 'bold',
      color: '#fef08a',
      shadow: { blur: 6, color: '#000000', fill: true, offsetY: 2 },
      padding: { top: 10, bottom: 10, left: 8, right: 8 }
    }).setOrigin(0.5).setDepth(UILayers.UI_TEXT);

    // Mascot Illustration
    const mascot = this.add.text(width / 2, 440, '🦚', {
      fontSize: '120px'
    }).setOrigin(0.5).setDepth(UILayers.UI_TEXT);

    this.tweens.add({
      targets: mascot,
      y: 420,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Start Button (Bottom Action Anchor)
    new Button(this, width / 2, 620, '▶ बिंगो सुरु गर्नुहोस् (START BINGO)', {
      width: 480,
      height: 90,
      fontSize: '32px',
      color: Theme.COLORS.SECONDARY,
      depth: UILayers.UI_BUTTONS,
      onClick: () => {
        audioManager.playButtonPress();
        audioManager.startBGM();
        this.scene.start('Game');
        this.scene.launch('UIScene');
      }
    });

    // How To Play Button
    new Button(this, width / 2, 735, '📖 कसरी खेल्ने (HOW TO PLAY)', {
      width: 420,
      height: 72,
      fontSize: '26px',
      color: Theme.COLORS.PRIMARY,
      depth: UILayers.UI_BUTTONS,
      onClick: () => {
        audioManager.playButtonPress();
        this.showHowToPlayModal();
      }
    });

    // Top-Left Dynamic Slot 0: Settings Button
    const settingsSlotPos = UIPositions.getTopLeftButtonPos(0);
    new IconButton(this, settingsSlotPos.x, settingsSlotPos.y, '⚙️', {
      size: 60,
      depth: UILayers.UI_BUTTONS,
      onClick: () => {
        audioManager.playButtonPress();
        new SettingsPanel(this);
      }
    });

    // Top-Right Sound Toggle Button
    const soundSlotPos = UIPositions.getTopRightButtonPos(0);
    const soundBtn = new IconButton(this, soundSlotPos.x, soundSlotPos.y, audioManager.sfxMuted ? '🔇' : '🔊', {
      size: 60,
      depth: UILayers.UI_BUTTONS,
      onClick: () => {
        const muted = audioManager.toggleSfxMute();
        audioManager.toggleMusicMute();
        soundBtn.setIcon(muted ? '🔇' : '🔊');
      }
    });
  }

  showHowToPlayModal() {
    const modal = new ModalBox(this, 'कसरी खेल्ने (How to Play)', 860, 640);

    const rules = [
      '1. 📣 Bingo Caller ले प्रश्न वा सुराग (Clues) सोध्नेछ।',
      '2. 🔲 आफ्नो ४x४ Bingo Card मा ध्यान दिएर सही उत्तर शब्द tile छान्नुहोस् र Stamp ⭐ लगाउनुहोस्।',
      '3. ✨ तेर्सो, ठाडो वा तेर्सो-ठाडो रेखा (Line) पूरा गरी B-I-N-G-O अक्षरहरू बाल्नुहोस्!',
      '4. 🏆 प्रत्येक चरण (Round) को आवश्यक Line पूरा गरेर जित हासिल गर्नुहोस्!',
      '5. 💡 आवश्यक परेमा Hint प्रयोग गरी सहयोग लिनुहोस्।'
    ];

    rules.forEach((rule, idx) => {
      const txt = this.add.text(-380, -180 + idx * 74, rule, {
        fontFamily: Theme.FONTS.BODY,
        fontSize: '24px',
        color: '#1e293b',
        wordWrap: { width: 760 },
        padding: { top: 8, bottom: 8, left: 6, right: 6 }
      });
      modal.content.add(txt);
    });

    const okBtn = new Button(this, 0, 220, 'बुझेँ! 👍 (GOT IT)', {
      width: 260,
      height: 60,
      fontSize: '26px',
      color: Theme.COLORS.SUCCESS,
      onClick: () => modal.hide()
    });
    modal.content.add(okBtn);

    modal.show();
  }
}

