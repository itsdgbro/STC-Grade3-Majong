import Phaser from 'phaser';
import { Theme } from '../utils/Theme';
import { ModalBox } from './ModalBox';
import { Button } from './Button';

/**
 * Standard Pause Panel modal enlarged to spacious size matching settings overlay
 */
export class PausePanel extends ModalBox {
  constructor(scene, onResume, onRestart) {
    // Enlarged from 720x500 -> 840x580
    super(scene, 'Game Paused', 840, 580, onResume);

    const resumeBtn = new Button(scene, 0, -45, '▶ RESUME', {
      width: 400,
      height: 88,
      fontSize: '40px',
      color: Theme.COLORS.SUCCESS,
      onClick: () => {
        this.hide();
        if (onResume) onResume();
      }
    });

    const restartBtn = new Button(scene, 0, 75, '🔄 RESTART', {
      width: 400,
      height: 88,
      fontSize: '40px',
      color: Theme.COLORS.SECONDARY,
      onClick: () => {
        this.hide();
        if (onRestart) onRestart();
      }
    });

    this.content.add(resumeBtn);
    this.content.add(restartBtn);

    this.show();
  }
}
