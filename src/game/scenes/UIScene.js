import Phaser from 'phaser';
import { Theme } from '../utils/Theme';
import { UILayers } from '../utils/UILayers';
import { UIPositions } from '../utils/UIPositions';
import { IconButton } from '../ui/IconButton';
import { Button } from '../ui/Button';
import { PausePanel } from '../ui/PausePanel';
import { SettingsPanel } from '../ui/SettingsPanel';
import { GameOverPanel } from '../ui/GameOverPanel';

/**
 * Screen-space UI Scene for HUD, Timer, Score, and Global Top Modals (Pause, Settings, GameOver)
 * Modals spawned in UIScene render at Layer 3 on the highest scene, covering the entire screen & HUD.
 */
export class UIScene extends Phaser.Scene {
  constructor() {
    super('UIScene');
  }

  create() {
    const width = 1920;

    // Layer 1: Header Container / Top Bar
    this.topBarBg = this.add.graphics();
    this.topBarBg.fillStyle(0xffffff, 0.95);
    this.topBarBg.fillRect(0, 0, width, 100);
    this.topBarBg.lineStyle(2, 0xe2e8f0, 1);
    this.topBarBg.strokeRect(0, 0, width, 100);
    this.topBarBg.setDepth(UILayers.UI_BACKGROUND_PANELS);

    // Slot 0 (70, 50): Pause Button
    this.pauseBtn = new IconButton(this, 70, 50, '⏸️', {
      size: 56,
      depth: UILayers.UI_BUTTONS,
      onClick: () => {
        const gameScene = this.scene.get('Game');
        if (gameScene) gameScene.togglePause();
      }
    });

    // Slot 1 (140, 50): Settings Button
    this.settingsBtn = new IconButton(this, 140, 50, '⚙️', {
      size: 56,
      depth: UILayers.UI_BUTTONS,
      onClick: () => {
        this.showSettingsModal();
      }
    });

    // Round Indicator Badge
    this.roundText = this.add.text(230, 50, 'Round 1 / 3', {
      fontFamily: Theme.FONTS.TITLE,
      fontSize: '38px',
      fontStyle: 'bold',
      color: '#0369a1',
      padding: { top: 10, bottom: 10, left: 6, right: 6 }
    }).setOrigin(0, 0.5).setDepth(UILayers.UI_TEXT);

    // Center HUD: Score & Timer
    this.scoreText = this.add.text(width / 2 - 200, 50, '⭐ Score: 0', {
      fontFamily: Theme.FONTS.TITLE,
      fontSize: '42px',
      fontStyle: 'bold',
      color: '#f59e0b',
      padding: { top: 10, bottom: 10, left: 6, right: 6 }
    }).setOrigin(0.5).setDepth(UILayers.UI_TEXT);

    this.timerText = this.add.text(width / 2, 50, '⏱️ 00:00', {
      fontFamily: Theme.FONTS.TITLE,
      fontSize: '42px',
      fontStyle: 'bold',
      color: '#0284c7',
      padding: { top: 10, bottom: 10, left: 6, right: 6 }
    }).setOrigin(0.5).setDepth(UILayers.UI_TEXT);

    // Right Action: Hint Button (Rectangular with text)
    this.hintBtn = new Button(this, width - 150, 50, '💡 HINT (3)', {
      width: 240,
      height: 68,
      fontSize: '32px',
      color: Theme.COLORS.SECONDARY,
      depth: UILayers.UI_BUTTONS,
      onClick: () => {
        const gameScene = this.scene.get('Game');
        if (gameScene) gameScene.useHint();
      }
    });

    // XP Display (right of timer)
    this.xpText = this.add.text(width / 2 + 320, 50, '✨ XP: 0', {
      fontFamily: Theme.FONTS.TITLE,
      fontSize: '42px',
      fontStyle: 'bold',
      color: '#a855f7',
      padding: { top: 10, bottom: 10, left: 6, right: 6 }
    }).setOrigin(0.5).setDepth(UILayers.UI_TEXT);

    // Process any queued updates
    if (this.pendingHUDData) {
      this.updateHUD(this.pendingHUDData);
      this.pendingHUDData = null;
    }
  }

  showPauseModal(onResume, onRestart) {
    new PausePanel(this, onResume, onRestart);
  }

  showSettingsModal() {
    new SettingsPanel(this);
  }

  showGameOverModal(options) {
    new GameOverPanel(this, options);
  }

  updateHUD(data = {}) {
    if (!this.scoreText) {
      this.pendingHUDData = { ...(this.pendingHUDData || {}), ...data };
      return;
    }

    if (data.score !== undefined && this.scoreText) {
      this.scoreText.setText(`⭐ Score: ${data.score}`);
    }
    if (data.xp !== undefined && this.xpText) {
      this.xpText.setText(`✨ XP: ${data.xp}`);
    }
    if (data.time !== undefined && this.timerText) {
      const min = Math.floor(data.time / 60).toString().padStart(2, '0');
      const sec = (data.time % 60).toString().padStart(2, '0');
      this.timerText.setText(`⏱️ ${min}:${sec}`);
    }
    if (data.round !== undefined && this.roundText) {
      this.roundText.setText(`Round ${data.round} / ${data.totalRounds || 3}`);
    }
    if (data.hintsRemaining !== undefined && this.hintBtn) {
      this.hintBtn.setText(`💡 HINT (${data.hintsRemaining})`);
    }
  }
}
