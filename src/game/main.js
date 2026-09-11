import Phaser from 'phaser';
import { Boot } from './scenes/Boot';
import { Preloader } from './scenes/Preloader';
import { MainMenu } from './scenes/MainMenu';
import { Game } from './scenes/Game';
import { UIScene } from './scenes/UIScene';

export const config = {
  type: Phaser.AUTO,
  width: 1920,
  height: 1080,
  parent: 'game-container',
  backgroundColor: '#0284c7',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [
    Boot,
    Preloader,
    MainMenu,
    Game,
    UIScene
  ]
};

export function createGame() {
  return new Phaser.Game(config);
}
