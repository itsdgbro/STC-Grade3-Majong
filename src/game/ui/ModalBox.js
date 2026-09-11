import Phaser from 'phaser';
import { Theme } from '../utils/Theme';
import { UILayers } from '../utils/UILayers';
import { UIPositions } from '../utils/UIPositions';

/**
 * Universal Modal Dialog Container complying with project-rules standard depths & transitions
 */
export class ModalBox extends Phaser.GameObjects.Container {
  constructor(scene, title, width = 740, height = 560, onClose = null, hideCloseButton = false) {
    super(scene, UIPositions.SCREEN_CENTER.x, UIPositions.SCREEN_CENTER.y);

    this.scene = scene;
    this.modalWidth = width;
    this.modalHeight = height;
    this.onClose = onClose;

    // Layer 3: Fullscreen Dim Backdrop
    this.backdrop = scene.add.graphics();
    this.backdrop.fillStyle(Theme.COLORS.MODAL_OVERLAY, 0.7);
    this.backdrop.fillRect(-1920 / 2, -1080 / 2, 1920, 1080);
    this.backdrop.setInteractive(new Phaser.Geom.Rectangle(-1920 / 2, -1080 / 2, 1920, 1080), Phaser.Geom.Rectangle.Contains);
    this.add(this.backdrop);

    // Modal Card Shadow
    this.cardShadow = scene.add.graphics();
    this.cardShadow.fillStyle(0x000000, 0.35);
    this.cardShadow.fillRoundedRect(-width / 2, -height / 2 + 10, width, height, 32);
    this.add(this.cardShadow);

    // Modal Card Background Panel
    this.cardBg = scene.add.graphics();
    this.cardBg.fillStyle(Theme.COLORS.WHITE, 1);
    this.cardBg.fillRoundedRect(-width / 2, -height / 2, width, height, 32);
    this.cardBg.lineStyle(4, Theme.COLORS.PRIMARY, 0.3);
    this.cardBg.strokeRoundedRect(-width / 2, -height / 2, width, height, 32);
    this.add(this.cardBg);

    // Header Title
    this.titleText = scene.add.text(0, -height / 2 + 50, title, {
      fontFamily: Theme.FONTS.TITLE,
      fontSize: '42px',
      fontStyle: 'bold',
      color: '#0369a1',
      align: 'center'
    }).setOrigin(0.5);
    this.add(this.titleText);

    if (!hideCloseButton) {
      // Close Button — center pinned to bottom-right corner of the panel
      const cbx = width / 2;
      const cby = height / 2;
      const cbr = 56;

      const closeBtnBg = scene.add.graphics();
      closeBtnBg.fillStyle(0xef4444, 1);
      closeBtnBg.fillCircle(cbx, cby, cbr);
      closeBtnBg.lineStyle(4, 0xffffff, 0.7);
      closeBtnBg.strokeCircle(cbx, cby, cbr);
      this.add(closeBtnBg);

      const closeX = scene.add.text(cbx, cby, '✕', {
        fontFamily: Theme.FONTS.TITLE,
        fontSize: '56px',
        fontStyle: 'bold',
        color: '#ffffff'
      }).setOrigin(0.5).setInteractive(new Phaser.Geom.Circle(0, 0, cbr), Phaser.Geom.Circle.Contains);

      closeX.on('pointerover', () => {
        closeBtnBg.clear();
        closeBtnBg.fillStyle(0xb91c1c, 1);
        closeBtnBg.fillCircle(cbx, cby, cbr);
        scene.tweens.add({ targets: closeX, scaleX: 1.12, scaleY: 1.12, duration: 80 });
      });
      closeX.on('pointerout', () => {
        closeBtnBg.clear();
        closeBtnBg.fillStyle(0xef4444, 1);
        closeBtnBg.fillCircle(cbx, cby, cbr);
        closeBtnBg.lineStyle(4, 0xffffff, 0.7);
        closeBtnBg.strokeCircle(cbx, cby, cbr);
        scene.tweens.add({ targets: closeX, scaleX: 1, scaleY: 1, duration: 80 });
      });
      closeX.on('pointerdown', () => this.hide());
      this.add(closeX);
    }

    // Content container
    this.content = scene.add.container(0, 20);
    this.add(this.content);

    this.setDepth(UILayers.MODAL_PANEL);
    this.setScale(0.85);
    this.setAlpha(0);

    scene.add.existing(this);
  }

  show() {
    this.scene.tweens.add({
      targets: this,
      scaleX: 1,
      scaleY: 1,
      alpha: 1,
      duration: 220,
      ease: 'Back.easeOut'
    });
  }

  hide() {
    this.scene.tweens.add({
      targets: this,
      scaleX: 0.85,
      scaleY: 0.85,
      alpha: 0,
      duration: 180,
      ease: 'Sine.easeIn',
      onComplete: () => {
        if (this.onClose) this.onClose();
        this.destroy();
      }
    });
  }
}
