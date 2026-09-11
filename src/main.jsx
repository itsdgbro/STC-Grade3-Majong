import './index.css';
import { createGame } from './game/main.js';

window.addEventListener('DOMContentLoaded', () => {
  createGame();

  // Attempt orientation lock for supporting platforms (Android Chrome)
  const tryLockLandscape = () => {
    try {
      if (screen.orientation && 'lock' in screen.orientation) {
        screen.orientation.lock('landscape').catch(() => {});
      }
    } catch (_) {}
  };

  window.addEventListener('pointerdown', tryLockLandscape, { once: true });
  window.addEventListener('touchstart', tryLockLandscape, { once: true });
});
