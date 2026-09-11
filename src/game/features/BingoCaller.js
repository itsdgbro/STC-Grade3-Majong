import Phaser from 'phaser';
import { Theme } from '../utils/Theme';
import { UILayers } from '../utils/UILayers';
import { audioManager } from '../services/AudioManager';
import { getCategoryIcon } from '../utils/categoryIcons';

/**
 * Caller/Announcer Machine for drawing educational cards/prompts
 */
export class BingoCaller extends Phaser.GameObjects.Container {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {Object} options
   */
  constructor(scene, x, y, options = {}) {
    super(scene, x, y);

    this.scene = scene;
    this.width = options.width || 640;
    this.height = options.height || 620;
    this.onNewCall = options.onNewCall || null;

    this.pool = [];
    this.history = [];
    this.currentCall = null;
    this.isAutoCalling = false;
    this.callIntervalMs = options.callIntervalMs || 5000;
    this.timerEvent = null;

    this.initUI();
    this.setDepth(UILayers.GAME);
    scene.add.existing(this);
  }

  initUI() {
    // Container Box Background Shadow
    this.shadow = this.scene.add.graphics();
    this.shadow.fillStyle(0x000000, 0.25);
    this.shadow.fillRoundedRect(-this.width / 2, -this.height / 2 + 8, this.width, this.height, 28);
    this.add(this.shadow);

    // Box Frame
    this.bg = this.scene.add.graphics();
    this.bg.fillStyle(0xffffff, 0.95);
    this.bg.fillRoundedRect(-this.width / 2, -this.height / 2, this.width, this.height, 28);
    this.bg.lineStyle(4, Theme.COLORS.SECONDARY, 0.9);
    this.bg.strokeRoundedRect(-this.width / 2, -this.height / 2, this.width, this.height, 28);
    this.add(this.bg);

    // Top Header Banner
    const headerBg = this.scene.add.graphics();
    headerBg.fillStyle(Theme.COLORS.SECONDARY, 1);
    headerBg.fillRoundedRect(-this.width / 2 + 10, -this.height / 2 + 10, this.width - 20, 72, 20);
    this.add(headerBg);

    this.headerText = this.scene.add.text(0, -this.height / 2 + 46, '📣 BINGO CALLER (सुराग सोध्ने)', {
      fontFamily: Theme.FONTS.TITLE,
      fontSize: '44px',
      fontStyle: 'bold',
      color: '#ffffff',
      padding: { top: 12, bottom: 12, left: 8, right: 8 }
    }).setOrigin(0.5);
    this.add(this.headerText);

    // Central Card Display Container
    this.callDisplay = this.scene.add.container(0, 0);
    this.add(this.callDisplay);

    // Lesson / Category Badge Box
    this.badgeBg = this.scene.add.graphics();
    this.badgeBg.fillStyle(0xe0f2fe, 1);
    this.badgeBg.fillRoundedRect(-270, -108, 540, 56, 18);
    this.badgeBg.lineStyle(2, 0x0284c7, 0.6);
    this.badgeBg.strokeRoundedRect(-270, -108, 540, 56, 18);
    this.callDisplay.add(this.badgeBg);

    // Lesson / Category Badge Text
    this.lessonBadgeText = this.scene.add.text(0, -80, 'पाठ १ • शब्दार्थ', {
      fontFamily: Theme.FONTS.BODY,
      fontSize: '30px',
      fontStyle: 'bold',
      color: '#0369a1',
      padding: { top: 10, bottom: 10, left: 8, right: 8 }
    }).setOrigin(0.5);
    this.callDisplay.add(this.lessonBadgeText);

    // Main Question Clue Text (The Question Prominently Displayed in Center)
    this.clueText = this.scene.add.text(0, 32, 'सुरु गर्न तयार हुनुहोस्!', {
      fontFamily: Theme.FONTS.TITLE,
      fontSize: '52px',
      fontStyle: 'bold',
      color: '#0f172a',
      align: 'center',
      wordWrap: { width: this.width - 60 },
      padding: { top: 18, bottom: 18, left: 10, right: 10 },
      lineSpacing: 6
    }).setOrigin(0.5);
    this.callDisplay.add(this.clueText);

    // Progress Bar showing time to next call
    this.progressBar = this.scene.add.graphics();
    this.add(this.progressBar);
  }

  setPool(items) {
    this.stopAutoCall();
    this.pool = [...items].sort(() => Math.random() - 0.5);
    this.history = [];
    this.currentCall = null;
    this.updateDisplay({
      clue: 'पहिलो सुराग आउँदैछ...',
      lesson: 'तयारी',
      category: 'बिंगो'
    });
  }

  nextCall() {
    if (this.pool.length === 0) {
      this.lessonBadgeText.setText('समाप्त');
      this.clueText.setText('सबै सुरागहरू बोलाइयो! बिंगो कार्ड जाँच्नुहोस्!');
      return null;
    }

    const item = this.pool.pop();
    this.history.push(item);
    this.currentCall = item;

    // Pop animation
    this.scene.tweens.add({
      targets: this.callDisplay,
      scaleX: 1.08,
      scaleY: 1.08,
      duration: 150,
      yoyo: true,
      ease: 'Back.easeOut'
    });

    this.updateDisplay(item);
    audioManager.playTileSelect();

    if (this.onNewCall) {
      this.onNewCall(item, this.history);
    }

    return item;
  }

  updateDisplay(item) {
    const lessonTag = item.lesson ? `${item.lesson}${item.lessonName ? ` (${item.lessonName})` : ''} • ${item.category || ''}` : 'सुराग';
    this.lessonBadgeText.setText(lessonTag);

    const clue = item.clue || item.word || '';
    this.clueText.setText(clue);

    // Adjust font size dynamically for long clues
    if (clue.length > 40) {
      this.clueText.setFontSize('38px');
    } else if (clue.length > 25) {
      this.clueText.setFontSize('44px');
    } else {
      this.clueText.setFontSize('52px');
    }
  }

  startAutoCall(intervalMs = null) {
    if (intervalMs) this.callIntervalMs = intervalMs;
    this.stopAutoCall();
    this.isAutoCalling = true;

    // Draw first immediately
    this.nextCall();

    this.timerEvent = this.scene.time.addEvent({
      delay: this.callIntervalMs,
      callback: () => {
        if (this.pool.length > 0) {
          this.nextCall();
        } else {
          this.stopAutoCall();
        }
      },
      loop: true
    });
  }

  stopAutoCall() {
    this.isAutoCalling = false;
    if (this.timerEvent) {
      this.timerEvent.remove();
      this.timerEvent = null;
    }
  }
}

