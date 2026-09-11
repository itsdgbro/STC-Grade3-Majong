import Phaser from 'phaser';
import { Theme } from '../utils/Theme';
import { UILayers } from '../utils/UILayers';

/**
 * B-I-N-G-O Letters Status Meter Component
 */
export class BingoMeter extends Phaser.GameObjects.Container {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   */
  constructor(scene, x, y) {
    super(scene, x, y);

    this.scene = scene;
    this.letters = ['B', 'I', 'N', 'G', 'O'];
    this.letterBadges = [];
    this.activeCount = 0;

    this.initUI();
    this.setDepth(UILayers.HUD);
    scene.add.existing(this);
  }

  initUI() {
    const spacing = 100;
    const totalWidth = this.letters.length * spacing;

    // Outer backdrop capsule
    const capsule = this.scene.add.graphics();
    capsule.fillStyle(0xffffff, 0.95);
    capsule.fillRoundedRect(-totalWidth / 2 - 20, -48, totalWidth + 40, 96, 48);
    capsule.lineStyle(3, 0xe2e8f0, 1);
    capsule.strokeRoundedRect(-totalWidth / 2 - 20, -48, totalWidth + 40, 96, 48);
    this.add(capsule);

    const startX = -((this.letters.length - 1) * spacing) / 2;

    this.letters.forEach((char, idx) => {
      const bx = startX + idx * spacing;
      const badgeContainer = this.scene.add.container(bx, 0);

      // Circle BG (Inactive: gray, Active: Gold/Rainbow)
      const circleBg = this.scene.add.graphics();
      circleBg.fillStyle(0xf1f5f9, 1);
      circleBg.fillCircle(0, 0, 40);
      circleBg.lineStyle(2, 0xcbd5e1, 1);
      circleBg.strokeCircle(0, 0, 40);
      badgeContainer.add(circleBg);

      // Letter Text
      const text = this.scene.add.text(0, 0, char, {
        fontFamily: Theme.FONTS.TITLE,
        fontSize: '48px',
        fontStyle: 'bold',
        color: '#94a3b8'
      }).setOrigin(0.5);
      badgeContainer.add(text);

      this.add(badgeContainer);

      this.letterBadges.push({
        container: badgeContainer,
        circleBg,
        text,
        isActive: false
      });
    });
  }

  setLinesCount(count) {
    this.activeCount = Math.min(this.letters.length, count);

    this.letterBadges.forEach((badge, idx) => {
      if (idx < this.activeCount && !badge.isActive) {
        badge.isActive = true;

        // Light up with animation
        badge.circleBg.clear();
        badge.circleBg.fillStyle(0xf59e0b, 1);
        badge.circleBg.fillCircle(0, 0, 40);
        badge.circleBg.lineStyle(3, 0xffffff, 1);
        badge.circleBg.strokeCircle(0, 0, 40);

        badge.text.setColor('#ffffff');

        this.scene.tweens.add({
          targets: badge.container,
          scaleX: 1.35,
          scaleY: 1.35,
          duration: 200,
          yoyo: true,
          ease: 'Back.easeOut'
        });
      } else if (idx >= this.activeCount && badge.isActive) {
        badge.isActive = false;
        badge.circleBg.clear();
        badge.circleBg.fillStyle(0xf1f5f9, 1);
        badge.circleBg.fillCircle(0, 0, 40);
        badge.circleBg.lineStyle(2, 0xcbd5e1, 1);
        badge.circleBg.strokeCircle(0, 0, 40);
        badge.text.setColor('#94a3b8');
      }
    });
  }

  reset() {
    this.setLinesCount(0);
  }
}
