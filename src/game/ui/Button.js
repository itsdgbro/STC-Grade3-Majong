import Phaser from 'phaser';
import { Theme } from '../utils/Theme';
import { UILayers } from '../utils/UILayers';

/**
 * Reusable animated Phaser Button component adhering to project-rules standard UI layers
 */
export class Button extends Phaser.GameObjects.Container {
  constructor(scene, x, y, text, config = {}) {
    super(scene, x, y);

    const width = config.width || 240;
    const height = config.height || 64;
    const color = config.color !== undefined ? config.color : Theme.COLORS.PRIMARY;
    const textColor = config.textColor || '#ffffff';
    const fontSize = config.fontSize || '34px';
    const radius = config.radius || 20;

    // Shadow
    this.shadow = scene.add.graphics();
    this.shadow.fillStyle(0x000000, 0.25);
    this.shadow.fillRoundedRect(-width / 2, -height / 2 + 6, width, height, radius);
    this.add(this.shadow);

    // Button Background
    this.bg = scene.add.graphics();
    this.bg.fillStyle(color, 1);
    this.bg.fillRoundedRect(-width / 2, -height / 2, width, height, radius);
    this.bg.lineStyle(3, 0xffffff, 0.6);
    this.bg.strokeRoundedRect(-width / 2, -height / 2, width, height, radius);
    this.add(this.bg);

    // Text Label
    this.label = scene.add.text(0, 0, text, {
      fontFamily: Theme.FONTS.TITLE,
      fontSize: fontSize,
      fontStyle: 'bold',
      color: textColor,
      align: 'center',
      padding: { top: 12, bottom: 12, left: 8, right: 8 }
    }).setOrigin(0.5);
    this.add(this.label);

    this.setSize(width, height);
    this.setInteractive({ useHandCursor: true });
    this.setDepth(config.depth || UILayers.UI_BUTTONS);

    this.on('pointerover', () => {
      scene.tweens.add({
        targets: this,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 120,
        ease: 'Sine.easeOut'
      });
    });

    this.on('pointerout', () => {
      scene.tweens.add({
        targets: this,
        scaleX: 1,
        scaleY: 1,
        duration: 120,
        ease: 'Sine.easeOut'
      });
    });

    this.on('pointerdown', () => {
      this.y += 3;
      if (config.onClick) {
        config.onClick();
      }
    });

    this.on('pointerup', () => {
      this.y -= 3;
    });

    scene.add.existing(this);
  }

  setText(text) {
    this.label.setText(text);
  }
}
