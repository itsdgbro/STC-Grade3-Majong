import Phaser from 'phaser';
import { Theme } from '../utils/Theme';
import { UILayers } from '../utils/UILayers';

/**
 * Animated Mascot Component (Snow Leopard / Danfe Guide)
 */
export class MascotController extends Phaser.GameObjects.Container {
  constructor(scene, x, y) {
    super(scene, x, y);

    this.scene = scene;

    // Speech Bubble Background
    this.bubble = scene.add.graphics();
    this.bubble.fillStyle(0xffffff, 0.95);
    this.bubble.fillRoundedRect(-540, -70, 560, 140, 20);
    this.bubble.lineStyle(3, Theme.COLORS.PRIMARY, 0.4);
    this.bubble.strokeRoundedRect(-540, -70, 560, 140, 20);

    // Pointer tail
    this.bubble.fillTriangle(-20, -5, -20, 20, 6, 8);
    this.add(this.bubble);

    // Speech Text
    this.speechText = scene.add.text(-260, -5, 'सुराग पढेर सही शब्द tile छान्नुहोस्!', {
      fontFamily: Theme.FONTS.BODY,
      fontSize: '30px',
      color: '#1e293b',
      fontStyle: '600',
      align: 'center',
      wordWrap: { width: 510 },
      padding: { top: 12, bottom: 12, left: 8, right: 8 }
    }).setOrigin(0.5);
    this.add(this.speechText);

    // Mascot Emoji Character Avatar
    this.avatar = scene.add.text(40, 0, '🐆', {
      fontSize: '100px'
    }).setOrigin(0.5);
    this.add(this.avatar);

    this.setDepth(UILayers.HUD);

    // Floating idle bounce
    scene.tweens.add({
      targets: this.avatar,
      y: -6,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    scene.add.existing(this);
  }

  say(text, mood = 'happy') {
    this.speechText.setText(text);
    if (mood === 'celebrate') {
      this.avatar.setText('🎉');
    } else if (mood === 'thinking') {
      this.avatar.setText('🧐');
    } else {
      this.avatar.setText('🐆');
    }

    this.scene.tweens.add({
      targets: this.bubble,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 100,
      yoyo: true
    });
  }
}
