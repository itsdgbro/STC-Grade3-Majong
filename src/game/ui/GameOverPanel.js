import Phaser from 'phaser';
import { Theme } from '../utils/Theme';
import { ModalBox } from './ModalBox';
import { Button } from './Button';

/**
 * Standard GameOver / Win Panel modal complying with project-rules standard UI & dynamic layout
 */
export class GameOverPanel extends ModalBox {
  /**
   * @param {Phaser.Scene} scene
   * @param {Object} options
   */
  constructor(scene, options = {}) {
    super(scene, options.title || '🎉 CONGRATULATIONS! 🎉', 1100, 750, options.onClose, true);

    const stars = options.stars || 3;
    const score = options.score || 0;
    const timeTaken = options.timeTaken || 0;
    const onReplay = options.onReplay;
    const onHome = options.onHome;
    const onNext = options.onNext;
    const isFinalRound = options.isFinalRound !== undefined ? options.isFinalRound : true;

    // Star Icons
    const starIcons = stars === 3 ? '⭐⭐⭐' : stars === 2 ? '⭐⭐' : '⭐';
    const starText = scene.add.text(0, -160, starIcons, {
      fontSize: '110px',
      align: 'center'
    }).setOrigin(0.5);
    this.content.add(starText);

    // Score & Time Summary Text
    const min = Math.floor(timeTaken / 60);
    const sec = timeTaken % 60;
    const scoreSummary = scene.add.text(0, -45, `Total Score: ${score} pts\nTime Taken: ${min}m ${sec}s`, {
      fontFamily: Theme.FONTS.BODY,
      fontSize: '42px',
      fontStyle: 'bold',
      color: '#0f172a',
      align: 'center',
      lineSpacing: 10
    }).setOrigin(0.5);
    this.content.add(scoreSummary);

    // Action Buttons Dynamic Layout (Rules: 3-buttons on intermediate, 2-buttons on final)
    if (!isFinalRound && onNext) {
      // 3 Buttons: Replay (left), Home (center), Next (right)
      const replayBtn = new Button(scene, -280, 160, '🔄 REPLAY', {
        width: 250,
        height: 84,
        fontSize: '32px',
        color: Theme.COLORS.SECONDARY,
        onClick: () => {
          this.hide();
          if (onReplay) onReplay();
        }
      });

      const homeBtn = new Button(scene, 0, 160, '🏠 HOME', {
        width: 250,
        height: 84,
        fontSize: '32px',
        color: Theme.COLORS.PRIMARY,
        onClick: () => {
          this.hide();
          if (onHome) onHome();
        }
      });

      const nextBtn = new Button(scene, 280, 160, '▶ NEXT', {
        width: 250,
        height: 84,
        fontSize: '32px',
        color: Theme.COLORS.SUCCESS,
        onClick: () => {
          this.hide();
          if (onNext) onNext();
        }
      });

      this.content.add(replayBtn);
      this.content.add(homeBtn);
      this.content.add(nextBtn);
    } else {
      // 2 Buttons symmetrically spaced: Replay & Home
      const replayBtn = new Button(scene, -200, 160, '🔄 PLAY AGAIN', {
        width: 340,
        height: 94,
        fontSize: '36px',
        color: Theme.COLORS.SUCCESS,
        onClick: () => {
          this.hide();
          if (onReplay) onReplay();
        }
      });

      const homeBtn = new Button(scene, 200, 160, '🏠 MAIN MENU', {
        width: 340,
        height: 94,
        fontSize: '36px',
        color: Theme.COLORS.PRIMARY,
        onClick: () => {
          this.hide();
          if (onHome) onHome();
        }
      });

      this.content.add(replayBtn);
      this.content.add(homeBtn);
    }

    this.show();
  }
}
