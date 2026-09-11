import Phaser from 'phaser';
import { Theme } from '../utils/Theme';

/**
 * Reusable Interactive Slider Component for Volume & Controls
 */
export class Slider extends Phaser.GameObjects.Container {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {Object} config
   */
  constructor(scene, x, y, config = {}) {
    super(scene, x, y);

    this.scene = scene;
    this.width = config.width || 320;
    this.height = config.height || 14;
    this.value = config.value !== undefined ? config.value : 0.7; // 0.0 to 1.0
    this.trackColor = config.trackColor || 0xe2e8f0;
    this.fillColor = config.fillColor || Theme.COLORS.PRIMARY;
    this.knobRadius = config.knobRadius || 16;
    this.onChange = config.onChange || null;

    this.initUI();
    scene.add.existing(this);
  }

  initUI() {
    // Track Background
    this.track = this.scene.add.graphics();
    this.track.fillStyle(this.trackColor, 1);
    this.track.fillRoundedRect(-this.width / 2, -this.height / 2, this.width, this.height, this.height / 2);
    this.add(this.track);

    // Active Fill Bar
    this.fillBar = this.scene.add.graphics();
    this.add(this.fillBar);

    // Knob Container
    this.knob = this.scene.add.container(0, 0);

    const knobShadow = this.scene.add.graphics();
    knobShadow.fillStyle(0x000000, 0.25);
    knobShadow.fillCircle(0, 2, this.knobRadius);
    this.knob.add(knobShadow);

    const knobBg = this.scene.add.graphics();
    knobBg.fillStyle(0xffffff, 1);
    knobBg.fillCircle(0, 0, this.knobRadius);
    knobBg.lineStyle(3, this.fillColor, 1);
    knobBg.strokeCircle(0, 0, this.knobRadius);
    this.knob.add(knobBg);

    const knobInner = this.scene.add.graphics();
    knobInner.fillStyle(this.fillColor, 1);
    knobInner.fillCircle(0, 0, this.knobRadius * 0.4);
    this.knob.add(knobInner);

    this.add(this.knob);

    // Interactive Hit Area across full track
    const hitArea = this.scene.add.zone(0, 0, this.width + this.knobRadius * 2, this.knobRadius * 2.8);
    hitArea.setInteractive({ useHandCursor: true });
    this.scene.input.setDraggable(hitArea);
    this.add(hitArea);

    hitArea.on('pointerdown', (pointer) => {
      this.updateValueFromPointer(pointer);
    });

    hitArea.on('drag', (pointer) => {
      this.updateValueFromPointer(pointer);
    });

    this.updateVisuals();
  }

  updateValueFromPointer(pointer) {
    const worldMatrix = this.getWorldTransformMatrix();
    const localX = (pointer.x - worldMatrix.tx) / worldMatrix.a;
    const clampedX = Phaser.Math.Clamp(localX, -this.width / 2, this.width / 2);
    const newValue = (clampedX + this.width / 2) / this.width;

    this.setValue(newValue);

    if (this.onChange) {
      this.onChange(this.value);
    }
  }

  setValue(val) {
    this.value = Phaser.Math.Clamp(val, 0, 1);
    this.updateVisuals();
  }

  getValue() {
    return this.value;
  }

  updateVisuals() {
    const fillWidth = this.width * this.value;
    const startX = -this.width / 2;

    this.fillBar.clear();
    if (fillWidth > 0) {
      this.fillBar.fillStyle(this.fillColor, 1);
      this.fillBar.fillRoundedRect(startX, -this.height / 2, fillWidth, this.height, this.height / 2);
    }

    this.knob.x = startX + fillWidth;
  }
}
