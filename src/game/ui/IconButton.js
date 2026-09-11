import Phaser from 'phaser';
import { Theme } from '../utils/Theme';
import { UILayers } from '../utils/UILayers';

/**
 * Reusable Circular Icon Button with standard center origin & depth layers
 */
export class IconButton extends Phaser.GameObjects.Container {
  constructor(scene, x, y, iconEmoji, config = {}) {
    super(scene, x, y);

    const size = config.size || 60;
    const radius = size / 2;
    const bgColor = config.bgColor !== undefined ? config.bgColor : 0xffffff;

    // Shadow
    this.shadow = scene.add.graphics();
    this.shadow.fillStyle(0x000000, 0.2);
    this.shadow.fillCircle(0, 3, radius);
    this.add(this.shadow);

    // Background
    this.bg = scene.add.graphics();
    this.bg.fillStyle(bgColor, 0.95);
    this.bg.fillCircle(0, 0, radius);
    this.bg.lineStyle(2, 0xe2e8f0, 1);
    this.bg.strokeCircle(0, 0, radius);
    this.add(this.bg);

    // Emoji / Icon Text
    this.iconText = scene.add.text(0, 0, iconEmoji, {
      fontSize: `${Math.floor(size * 0.48)}px`,
      align: 'center'
    }).setOrigin(0.5);
    this.add(this.iconText);

    this.setSize(size, size);
    this.setInteractive({ useHandCursor: true });
    this.setDepth(config.depth || UILayers.UI_BUTTONS);

    this.on('pointerover', () => {
      scene.tweens.add({
        targets: this,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 100
      });
    });

    this.on('pointerout', () => {
      scene.tweens.add({
        targets: this,
        scaleX: 1,
        scaleY: 1,
        duration: 100
      });
    });

    this.on('pointerdown', () => {
      this.y += 2;
      if (config.onClick) config.onClick();
    });

    this.on('pointerup', () => {
      this.y -= 2;
    });

    scene.add.existing(this);
  }

  setIcon(iconEmoji) {
    this.iconText.setText(iconEmoji);
  }
}
