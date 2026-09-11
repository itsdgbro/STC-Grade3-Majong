import Phaser from 'phaser';
import { Theme } from '../utils/Theme';
import { loadGameLevels } from '../utils/dataLoader';

/**
 * Preloader Scene: Loads game assets and shows an elegant progress bar
 */
export class Preloader extends Phaser.Scene {
  constructor() {
    super('Preloader');
  }

  preload() {
    const width = 1920;
    const height = 1080;

    // Gradient backdrop
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x38bdf8, 0x38bdf8, 0x0284c7, 0x0369a1, 1);
    bg.fillRect(0, 0, width, height);

    // Title
    this.add.text(width / 2, height / 2 - 80, 'नेपाली शब्द बिंगो (Grade 3 Nepali Bingo)', {
      fontFamily: Theme.FONTS.TITLE,
      fontSize: '48px',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Progress Bar Outline
    const progressBarBox = this.add.graphics();
    progressBarBox.fillStyle(0x0f172a, 0.4);
    progressBarBox.fillRoundedRect(width / 2 - 250, height / 2 + 20, 500, 36, 18);

    const progressBar = this.add.graphics();

    this.load.on('progress', (value) => {
      progressBar.clear();
      progressBar.fillStyle(0xfcd34d, 1);
      progressBar.fillRoundedRect(width / 2 - 245, height / 2 + 25, 490 * value, 26, 13);
    });

    // Load available background images if present
    this.load.image('bg_forest', 'images/forest.jpg');
    this.load.image('bg_hills', 'images/hills.jpg');
    this.load.image('bg_mountain', 'images/mountain.jpg');
    this.load.image('bg_paddy', 'images/paddy.jpg');
    this.load.image('bg_rhododendron', 'images/rhododendron.jpg');
    this.load.image('bg_river', 'images/river.jpg');

    // Load game dataset
    loadGameLevels().catch((err) => {
      console.warn('[Preloader] Level loading notice:', err);
    });
  }

  async create() {
    try {
      await loadGameLevels();
    } catch (_) {}

    // Ensure Mukta font is loaded into browser document.fonts
    if (typeof document !== 'undefined' && document.fonts) {
      try {
        await Promise.all([
          document.fonts.load('16px Mukta'),
          document.fonts.load('bold 24px Mukta'),
          document.fonts.load('800 36px Mukta')
        ]);
      } catch (_) {}
    }

    this.scene.start('MainMenu');
  }
}

