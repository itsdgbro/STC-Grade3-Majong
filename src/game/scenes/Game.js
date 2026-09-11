import Phaser from 'phaser';
import { Theme } from '../utils/Theme';
import { UILayers } from '../utils/UILayers';
import { UIPositions } from '../utils/UIPositions';
import { BingoCard } from '../features/BingoCard';
import { BingoCaller } from '../features/BingoCaller';
import { BingoMeter } from '../features/BingoMeter';
import { MascotController } from '../features/MascotController';
import { Button } from '../ui/Button';
import { audioManager } from '../services/AudioManager';
import { flutterBridge } from '../services/FlutterBridgeService';
import { getLoadedGameData } from '../utils/dataLoader';

/**
 * Main Game Scene orchestrating Educational Bingo Rounds, Caller, Card, Scoring & Victory
 */
export class Game extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  create() {
    const width = 1920;
    const height = 1080;

    // Background Image (Layer 0)
    if (this.textures.exists('bg_hills')) {
      const bg = this.add.image(width / 2, height / 2, 'bg_hills').setDisplaySize(width, height);
      bg.setDepth(UILayers.GAME_BACKGROUND);
      const overlay = this.add.graphics();
      overlay.fillStyle(0xffffff, 0.25);
      overlay.fillRect(0, 0, width, height);
      overlay.setDepth(UILayers.GAME_BACKGROUND);
    } else {
      const bg = this.add.graphics();
      bg.fillGradientStyle(0x38bdf8, 0x38bdf8, 0x0284c7, 0x0369a1, 1);
      bg.fillRect(0, 0, width, height);
      bg.setDepth(UILayers.GAME_BACKGROUND);
    }

    // Load level data & questions
    this.gameData = getLoadedGameData();
    this.levelInfo = Array.isArray(this.gameData) ? this.gameData[0] : (this.gameData || {});
    this.allQuestions = this.levelInfo.questions || [];

    // State Variables
    this.currentRoundIndex = 0;
    this.totalRounds = 3;
    this.score = 0;
    this.xp = 0;
    this.hintsRemaining = 3;
    this.gameTimeSeconds = 0;
    this.isPaused = false;
    this.isLevelFinished = false;
    this.calledItemsHistory = [];
    this.currentCalledItem = null;

    // Build Round Configurations from dataset questions
    this.roundConfigs = this.buildRoundConfigs();

    // Feature Component: Mascot Guide
    this.mascot = new MascotController(this, width - 240, height - 120);

    // Feature Component: Bingo Letter Progress Meter
    this.bingoMeter = new BingoMeter(this, UIPositions.TOP_HUD_CENTER.x, 150);

    // Feature Component: Bingo Card (Left-Center)
    this.bingoCard = new BingoCard(this, 580, 600, {
      gridSize: 4,
      tileSize: 164,
      gap: 14,
      onTileMarked: (item, tileData) => this.handleTileMarkAttempt(item, tileData),
      onLineCompleted: (totalLines, newLines) => this.handleLineCompleted(totalLines, newLines)
    });

    // Feature Component: Bingo Caller Machine (Right-Center)
    this.bingoCaller = new BingoCaller(this, 1340, 470, {
      width: 640,
      height: 520,
      onNewCall: (item, history) => this.handleNewCallerItem(item, history)
    });

    // Caller Action Button (Next Call / Call Ball)
    this.nextCallBtn = new Button(this, 1340, 800, '🏆 अर्को सुराग (NEXT CALL)', {
      width: 460,
      height: 90,
      fontSize: '36px',
      color: Theme.COLORS.SECONDARY,
      depth: UILayers.UI_BUTTONS,
      onClick: () => {
        this.bingoCaller.nextCall();
      }
    });

    // Timer Loop
    this.timerEvent = this.time.addEvent({
      delay: 1000,
      callback: () => {
        if (!this.isPaused && !this.isLevelFinished) {
          this.gameTimeSeconds++;
          this.syncHUD();
        }
      },
      loop: true
    });

    // Listen for Flutter Bridge commands
    flutterBridge.on('PAUSE', () => this.togglePause(true));
    flutterBridge.on('RESUME', () => this.togglePause(false));
    flutterBridge.on('RESTART', () => this.restartGame());

    // Start Round 1
    this.startRound(0);
  }

  buildRoundConfigs() {
    const totalQ = this.allQuestions.length;
    let pool1 = [], pool2 = [], pool3 = [];

    if (totalQ >= 45) {
      pool1 = this.allQuestions.slice(0, Math.floor(totalQ / 3));
      pool2 = this.allQuestions.slice(Math.floor(totalQ / 3), Math.floor((totalQ * 2) / 3));
      pool3 = this.allQuestions.slice(Math.floor((totalQ * 2) / 3));
    } else {
      pool1 = this.allQuestions;
      pool2 = this.allQuestions;
      pool3 = this.allQuestions;
    }

    return [
      {
        round: 1,
        title: 'Round 1: पाठ १ - ७ (शब्दार्थ र वाक्य पूरा)',
        pool: pool1,
        targetLines: 2,
        callIntervalMs: 6000
      },
      {
        round: 2,
        title: 'Round 2: पाठ ८ - १५ (व्याकरण र विपरीतार्थक)',
        pool: pool2,
        targetLines: 3,
        callIntervalMs: 5500
      },
      {
        round: 3,
        title: 'Round 3: पाठ १६ - २३ (शब्द निर्माण र संस्कृति Master)',
        pool: pool3,
        targetLines: 4,
        callIntervalMs: 5000
      }
    ];
  }

  startRound(roundIndex) {
    this.currentRoundIndex = roundIndex;
    const config = this.roundConfigs[roundIndex] || this.roundConfigs[0];
    const roundPool = config.pool.length > 0 ? config.pool : this.allQuestions;

    this.targetLines = config.targetLines;
    this.calledItemsHistory = [];
    this.currentCalledItem = null;
    this.bingoMeter.reset();

    // Randomly select 16 questions for player card
    const cardItems = [...roundPool].sort(() => Math.random() - 0.5).slice(0, 16);
    this.bingoCard.populate(cardItems);

    // Caller pool includes card items + up to 8 extra distractors from round pool
    const unusedExtra = roundPool.filter(q => !cardItems.some(c => c.id === q.id));
    const extraDistractorCount = Math.min(8, unusedExtra.length);
    const distractors = [...unusedExtra].sort(() => Math.random() - 0.5).slice(0, extraDistractorCount);
    const callerPool = [...cardItems, ...distractors];

    this.bingoCaller.setPool(callerPool);

    // Announcement Banner
    this.showRoundBanner(`${config.title}\nलक्ष्य: BINGO को लागि ${config.targetLines} Lines पूरा गर्नुहोस्!`);
    this.mascot.say(`Round ${roundIndex + 1}! सुराग ध्यान दिएर सुन्नुहोस् र सही शब्द tile छान्नुहोस्!`, 'happy');

    // Auto-draw first call after banner
    this.time.delayedCall(1800, () => {
      this.bingoCaller.startAutoCall(config.callIntervalMs);
    });

    this.syncHUD();
  }

  showRoundBanner(text) {
    const banner = this.add.text(UIPositions.SCREEN_CENTER.x, UIPositions.SCREEN_CENTER.y, text, {
      fontFamily: Theme.FONTS.TITLE,
      fontSize: '64px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#0284c7',
      strokeThickness: 14,
      align: 'center',
      shadow: { blur: 20, color: '#000000', fill: true, offsetY: 8 },
      padding: { top: 20, bottom: 20, left: 14, right: 14 }
    }).setOrigin(0.5).setDepth(UILayers.OVERLAY_TEXT).setScale(0.5).setAlpha(0);

    this.tweens.add({
      targets: banner,
      scaleX: 1,
      scaleY: 1,
      alpha: 1,
      duration: 350,
      ease: 'Back.easeOut',
      yoyo: true,
      hold: 1400,
      onComplete: () => banner.destroy()
    });
  }

  handleNewCallerItem(item, history) {
    this.currentCalledItem = item;
    this.calledItemsHistory = history;

    // Check if player has this item on their card
    const onCard = this.bingoCard.hasItem(item.id);
    if (onCard) {
      this.mascot.say(`"${item.word}" तपाईंको कार्डमा छ! छान्नुहोस्!`, 'happy');
    } else {
      this.mascot.say(`सुराग: "${item.clue}"। कार्ड हेर्नुहोस्!`, 'thinking');
    }
  }

  handleTileMarkAttempt(item, tileData) {
    const wasCalled = this.calledItemsHistory.some(c => c.id === item.id);

    if (wasCalled) {
      audioManager.playTileMatch();
      this.score += 150;
      this.xp += 100;
      this.mascot.say(`उत्कृष्ट! "${item.word}" छानियो! (+100 XP)`, 'celebrate');
      this.syncHUD();
      return true;
    } else {
      audioManager.playMismatch();
      this.xp = Math.max(0, this.xp - 25);
      this.mascot.say(`अझै बोलाइएको छैन! बोलाइएको सुराग सुन्नुहोस्। (-25 XP)`, 'thinking');
      this.syncHUD();
      return false;
    }
  }

  handleLineCompleted(totalLines, newLines) {
    audioManager.playArpeggio([523.25, 659.25, 783.99, 1046.50], 0.08, 'triangle', 0.25);
    this.score += newLines * 300;
    this.bingoMeter.setLinesCount(totalLines);

    this.mascot.say(`🎉 LINE COMPLETED! (${totalLines}/${this.targetLines})`, 'celebrate');
    this.syncHUD();

    if (totalLines >= this.targetLines) {
      this.handleRoundVictory();
    }
  }

  handleRoundVictory() {
    this.bingoCaller.stopAutoCall();
    audioManager.playRoundComplete();

    this.showBingoCelebrationText();

    this.time.delayedCall(1600, () => {
      const isFinalRound = this.currentRoundIndex + 1 >= this.totalRounds;
      const uiScene = this.scene.get('UIScene');

      if (!isFinalRound) {
        if (uiScene) {
          uiScene.showGameOverModal({
            title: `🎉 ROUND ${this.currentRoundIndex + 1} CLEARED! 🎉`,
            stars: 3,
            score: this.score,
            timeTaken: this.gameTimeSeconds,
            isFinalRound: false,
            onReplay: () => this.startRound(this.currentRoundIndex),
            onHome: () => {
              this.scene.stop('UIScene');
              this.scene.start('MainMenu');
            },
            onNext: () => this.startRound(this.currentRoundIndex + 1)
          });
        }
      } else {
        this.handleGameVictory();
      }
    });
  }

  showBingoCelebrationText() {
    const bingoText = this.add.text(UIPositions.SCREEN_CENTER.x, UIPositions.SCREEN_CENTER.y, '✨ B-I-N-G-O! ✨', {
      fontFamily: Theme.FONTS.TITLE,
      fontSize: '80px',
      fontStyle: 'bold',
      color: '#fef08a',
      stroke: '#d97706',
      strokeThickness: 12,
      shadow: { blur: 20, color: '#000000', fill: true, offsetY: 8 },
      padding: { top: 20, bottom: 20, left: 14, right: 14 }
    }).setOrigin(0.5).setDepth(UILayers.OVERLAY_TEXT).setScale(0.2).setAlpha(0);

    this.tweens.add({
      targets: bingoText,
      scaleX: 1.25,
      scaleY: 1.25,
      alpha: 1,
      duration: 400,
      ease: 'Back.easeOut',
      yoyo: true,
      hold: 900,
      onComplete: () => bingoText.destroy()
    });
  }

  handleGameVictory() {
    this.isLevelFinished = true;
    audioManager.playVictory();
    this.mascot.say('🏆 विजय! तपाईं कक्षा ३ बिंगो Master हुनुभयो!', 'celebrate');

    // Calculate stars from level metadata
    const time = this.gameTimeSeconds;
    const starTimes = this.levelInfo.starTimes || { threeStars: 120, twoStars: 200 };
    let stars = 1;
    if (time <= starTimes.threeStars) stars = 3;
    else if (time <= starTimes.twoStars) stars = 2;

    // Dispatch Flutter Bridge Event
    flutterBridge.sendLevelCompleted(this.score, {
      stars: stars,
      timeTakenSeconds: time
    });

    const uiScene = this.scene.get('UIScene');
    if (uiScene) {
      uiScene.showGameOverModal({
        title: '🏆 BINGO GRAND CHAMPION! 🏆',
        stars: stars,
        score: this.score,
        timeTaken: time,
        isFinalRound: true,
        onReplay: () => this.restartGame(),
        onHome: () => {
          this.scene.stop('UIScene');
          this.scene.start('MainMenu');
        }
      });
    }
  }

  useHint() {
    if (this.hintsRemaining <= 0) {
      this.mascot.say('कुनै सङ्केत (Hint) बाँकी छैन!', 'thinking');
      return;
    }

    if (!this.currentCalledItem) {
      this.mascot.say('पहिलो सुराग सोध्न दिनुहोस्!', 'thinking');
      return;
    }

    const hinted = this.bingoCard.highlightTileHint(this.currentCalledItem.id);
    if (hinted) {
      this.hintsRemaining--;
      audioManager.playHint();
      const tip = this.currentCalledItem.hint || `कार्डमा "${this.currentCalledItem.word}" भेटियो!`;
      this.mascot.say(`💡 सङ्केत: ${tip}`, 'happy');
      this.syncHUD();
    } else {
      this.mascot.say(`"${this.currentCalledItem.word}" कार्डमा छैन।`, 'thinking');
    }
  }

  togglePause(forceState = null) {
    this.isPaused = forceState !== null ? forceState : !this.isPaused;
    if (this.isPaused) {
      this.bingoCaller.stopAutoCall();
      const uiScene = this.scene.get('UIScene');
      if (uiScene) {
        uiScene.showPauseModal(
          () => {
            this.isPaused = false;
            const config = this.roundConfigs[this.currentRoundIndex] || this.roundConfigs[0];
            this.bingoCaller.startAutoCall(config.callIntervalMs);
          },
          () => {
            this.restartGame();
          }
        );
      }
    }
  }

  showSettingsModal() {
    const uiScene = this.scene.get('UIScene');
    if (uiScene) {
      uiScene.showSettingsModal();
    }
  }

  restartGame() {
    this.bingoCaller.stopAutoCall();
    this.score = 0;
    this.xp = 0;
    this.gameTimeSeconds = 0;
    this.hintsRemaining = 3;
    this.isLevelFinished = false;
    this.isPaused = false;
    this.startRound(0);
  }

  syncHUD() {
    const uiScene = this.scene.get('UIScene');
    if (uiScene) {
      uiScene.updateHUD({
        score: this.score,
        xp: this.xp,
        time: this.gameTimeSeconds,
        round: this.currentRoundIndex + 1,
        totalRounds: this.totalRounds,
        hintsRemaining: this.hintsRemaining
      });
    }
  }
}

