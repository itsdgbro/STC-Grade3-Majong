import Phaser from 'phaser';

/**
 * Boot Scene: Prepares minimal assets and immediately switches to Preloader
 */
export class Boot extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    // Load minimal loading splash assets if needed
  }

  create() {
    this.scene.start('Preloader');
  }
}
