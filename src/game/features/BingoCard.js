import Phaser from 'phaser';
import { Theme } from '../utils/Theme';
import { UILayers } from '../utils/UILayers';
import { getCategoryIcon } from '../utils/categoryIcons';

/**
 * Interactive Bingo Card Component (4x4 or NxN Grid)
 */
export class BingoCard extends Phaser.GameObjects.Container {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {Object} options
   */
  constructor(scene, x, y, options = {}) {
    super(scene, x, y);

    this.scene = scene;
    this.gridSize = options.gridSize || 4; // 4x4
    this.tileSize = options.tileSize || 128;
    this.gap = options.gap || 8;
    this.onTileMarked = options.onTileMarked || null;
    this.onLineCompleted = options.onLineCompleted || null;
    this.onBingoAchieved = options.onBingoAchieved || null;

    this.cardWidth = this.gridSize * this.tileSize + (this.gridSize - 1) * this.gap + 32;
    this.cardHeight = this.gridSize * this.tileSize + (this.gridSize - 1) * this.gap + 32;

    this.grid = []; // 2D array of tile objects
    this.completedLines = {
      rows: new Set(),
      cols: new Set(),
      diag1: false,
      diag2: false
    };

    this.totalCompletedLinesCount = 0;

    this.initCardBackground();
    this.setDepth(UILayers.GAME);
    scene.add.existing(this);
  }

  initCardBackground() {
    // Card Shadow
    this.shadow = this.scene.add.graphics();
    this.shadow.fillStyle(0x000000, 0.25);
    this.shadow.fillRoundedRect(-this.cardWidth / 2, -this.cardHeight / 2 + 8, this.cardWidth, this.cardHeight, 28);
    this.add(this.shadow);

    // Card Frame
    this.cardBg = this.scene.add.graphics();
    this.cardBg.fillStyle(0xffffff, 0.96);
    this.cardBg.fillRoundedRect(-this.cardWidth / 2, -this.cardHeight / 2, this.cardWidth, this.cardHeight, 28);
    this.cardBg.lineStyle(4, Theme.COLORS.PRIMARY, 0.8);
    this.cardBg.strokeRoundedRect(-this.cardWidth / 2, -this.cardHeight / 2, this.cardWidth, this.cardHeight, 28);
    this.add(this.cardBg);

    // Container for tiles
    this.tilesContainer = this.scene.add.container(0, 0);
    this.add(this.tilesContainer);

    // Container for line highlights
    this.linesContainer = this.scene.add.container(0, 0);
    this.add(this.linesContainer);
  }

  /**
   * Populate Card with items
   * @param {Array} items - Array of at least gridSize * gridSize items
   */
  populate(items) {
    this.tilesContainer.removeAll(true);
    this.linesContainer.removeAll(true);
    this.grid = [];
    this.completedLines = {
      rows: new Set(),
      cols: new Set(),
      diag1: false,
      diag2: false
    };
    this.totalCompletedLinesCount = 0;

    const totalTiles = this.gridSize * this.gridSize;
    const shuffled = [...items].sort(() => Math.random() - 0.5).slice(0, totalTiles);

    const startX = -((this.gridSize - 1) * (this.tileSize + this.gap)) / 2;
    const startY = -((this.gridSize - 1) * (this.tileSize + this.gap)) / 2;

    for (let r = 0; r < this.gridSize; r++) {
      this.grid[r] = [];
      for (let c = 0; c < this.gridSize; c++) {
        const item = shuffled[r * this.gridSize + c];
        const tileX = startX + c * (this.tileSize + this.gap);
        const tileY = startY + r * (this.tileSize + this.gap);

        const tileObj = this.createTile(r, c, tileX, tileY, item);
        this.grid[r][c] = tileObj;
        this.tilesContainer.add(tileObj.container);
      }
    }
  }

  createTile(row, col, x, y, item) {
    const tileContainer = this.scene.add.container(x, y);
    const size = this.tileSize;

    // Tile Shadow
    const shadow = this.scene.add.graphics();
    shadow.fillStyle(0x000000, 0.15);
    shadow.fillRoundedRect(-size / 2, -size / 2 + 4, size, size, 16);
    tileContainer.add(shadow);

    // Tile BG
    const bg = this.scene.add.graphics();
    bg.fillStyle(0xf8fafc, 1);
    bg.fillRoundedRect(-size / 2, -size / 2, size, size, 16);
    bg.lineStyle(2, 0xcbd5e1, 1);
    bg.strokeRoundedRect(-size / 2, -size / 2, size, size, 16);
    tileContainer.add(bg);

    // Word Text (100% Text-Based - Centered Extra-Large Text)
    const wordTextStr = item.word || '';
    let fontSize = '44px';
    if (wordTextStr.length > 10) {
      fontSize = '30px';
    } else if (wordTextStr.length > 6) {
      fontSize = '36px';
    }

    const word = this.scene.add.text(0, 0, wordTextStr, {
      fontFamily: Theme.FONTS.BODY,
      fontSize: fontSize,
      fontStyle: 'bold',
      color: '#0f172a',
      align: 'center',
      wordWrap: { width: size - 14 },
      padding: { top: 16, bottom: 16, left: 6, right: 6 }
    }).setOrigin(0.5);
    tileContainer.add(word);

    // Stamp container (for marked star)
    const stampContainer = this.scene.add.container(0, 0);
    stampContainer.setVisible(false);
    tileContainer.add(stampContainer);

    const stampBg = this.scene.add.graphics();
    stampBg.fillStyle(0xf59e0b, 0.3);
    stampBg.fillRoundedRect(-size / 2, -size / 2, size, size, 16);
    stampBg.lineStyle(3, 0xf59e0b, 1);
    stampBg.strokeRoundedRect(-size / 2, -size / 2, size, size, 16);
    stampContainer.add(stampBg);

    const stampStar = this.scene.add.text(size / 2 - 24, -size / 2 + 24, '⭐', {
      fontSize: '32px'
    }).setOrigin(0.5);
    stampContainer.add(stampStar);

    // Interactive hitbox
    tileContainer.setSize(size, size);
    tileContainer.setInteractive({ useHandCursor: true });

    const tileData = {
      row,
      col,
      item,
      container: tileContainer,
      bg,
      word,
      stampContainer,
      isMarked: false
    };

    tileContainer.on('pointerover', () => {
      if (!tileData.isMarked) {
        this.scene.tweens.add({
          targets: tileContainer,
          scaleX: 1.06,
          scaleY: 1.06,
          duration: 100,
          ease: 'Sine.easeOut'
        });
      }
    });

    tileContainer.on('pointerout', () => {
      if (!tileData.isMarked) {
        this.scene.tweens.add({
          targets: tileContainer,
          scaleX: 1,
          scaleY: 1,
          duration: 100,
          ease: 'Sine.easeOut'
        });
      }
    });

    tileContainer.on('pointerdown', () => {
      this.handleTileClick(tileData);
    });

    return tileData;
  }

  handleTileClick(tileData) {
    if (tileData.isMarked) return;

    if (this.onTileMarked) {
      const isCorrect = this.onTileMarked(tileData.item, tileData);
      if (isCorrect) {
        this.markTile(tileData);
      } else {
        this.shakeTile(tileData);
      }
    }
  }

  markTile(tileData) {
    tileData.isMarked = true;
    tileData.stampContainer.setVisible(true);
    tileData.stampContainer.setScale(1.8);
    tileData.stampContainer.setAlpha(0);

    // Animate Stamp Pop
    this.scene.tweens.add({
      targets: tileData.stampContainer,
      scaleX: 1,
      scaleY: 1,
      alpha: 1,
      duration: 250,
      ease: 'Back.easeOut'
    });

    // Darken text for contrast
    tileData.word.setColor('#b45309');

    // Check for Lines
    this.checkForLines();
  }

  shakeTile(tileData) {
    this.scene.tweens.add({
      targets: tileData.container,
      x: tileData.container.x + 8,
      duration: 50,
      yoyo: true,
      repeat: 3,
      ease: 'Sine.easeInOut'
    });
  }

  highlightTileHint(itemId) {
    for (let r = 0; r < this.gridSize; r++) {
      for (let c = 0; c < this.gridSize; c++) {
        const tile = this.grid[r][c];
        if (tile.item.id === itemId && !tile.isMarked) {
          this.scene.tweens.add({
            targets: tile.container,
            scaleX: 1.15,
            scaleY: 1.15,
            duration: 200,
            yoyo: true,
            repeat: 3
          });
          return true;
        }
      }
    }
    return false;
  }

  checkForLines() {
    let newlyCompletedLines = 0;

    // 1. Check Rows
    for (let r = 0; r < this.gridSize; r++) {
      if (!this.completedLines.rows.has(r)) {
        let full = true;
        for (let c = 0; c < this.gridSize; c++) {
          if (!this.grid[r][c].isMarked) {
            full = false;
            break;
          }
        }
        if (full) {
          this.completedLines.rows.add(r);
          newlyCompletedLines++;
          this.drawCompletedLine('row', r);
        }
      }
    }

    // 2. Check Cols
    for (let c = 0; c < this.gridSize; c++) {
      if (!this.completedLines.cols.has(c)) {
        let full = true;
        for (let r = 0; r < this.gridSize; r++) {
          if (!this.grid[r][c].isMarked) {
            full = false;
            break;
          }
        }
        if (full) {
          this.completedLines.cols.add(c);
          newlyCompletedLines++;
          this.drawCompletedLine('col', c);
        }
      }
    }

    // 3. Diagonal 1 (Top-Left to Bottom-Right)
    if (!this.completedLines.diag1) {
      let full = true;
      for (let i = 0; i < this.gridSize; i++) {
        if (!this.grid[i][i].isMarked) {
          full = false;
          break;
        }
      }
      if (full) {
        this.completedLines.diag1 = true;
        newlyCompletedLines++;
        this.drawCompletedLine('diag1');
      }
    }

    // 4. Diagonal 2 (Top-Right to Bottom-Left)
    if (!this.completedLines.diag2) {
      let full = true;
      for (let i = 0; i < this.gridSize; i++) {
        if (!this.grid[i][this.gridSize - 1 - i].isMarked) {
          full = false;
          break;
        }
      }
      if (full) {
        this.completedLines.diag2 = true;
        newlyCompletedLines++;
        this.drawCompletedLine('diag2');
      }
    }

    if (newlyCompletedLines > 0) {
      this.totalCompletedLinesCount += newlyCompletedLines;
      if (this.onLineCompleted) {
        this.onLineCompleted(this.totalCompletedLinesCount, newlyCompletedLines);
      }
    }
  }

  drawCompletedLine(type, index = 0) {
    const lineGfx = this.scene.add.graphics();
    lineGfx.lineStyle(8, 0x10b981, 0.85);

    const startOffset = -((this.gridSize - 1) * (this.tileSize + this.gap)) / 2;
    const endOffset = ((this.gridSize - 1) * (this.tileSize + this.gap)) / 2;

    if (type === 'row') {
      const y = startOffset + index * (this.tileSize + this.gap);
      lineGfx.strokeLineShape(new Phaser.Geom.Line(startOffset - this.tileSize / 2, y, endOffset + this.tileSize / 2, y));
    } else if (type === 'col') {
      const x = startOffset + index * (this.tileSize + this.gap);
      lineGfx.strokeLineShape(new Phaser.Geom.Line(x, startOffset - this.tileSize / 2, x, endOffset + this.tileSize / 2));
    } else if (type === 'diag1') {
      lineGfx.strokeLineShape(new Phaser.Geom.Line(startOffset - this.tileSize / 2, startOffset - this.tileSize / 2, endOffset + this.tileSize / 2, endOffset + this.tileSize / 2));
    } else if (type === 'diag2') {
      lineGfx.strokeLineShape(new Phaser.Geom.Line(endOffset + this.tileSize / 2, startOffset - this.tileSize / 2, startOffset - this.tileSize / 2, endOffset + this.tileSize / 2));
    }

    this.linesContainer.add(lineGfx);

    // Pulse effect
    this.scene.tweens.add({
      targets: lineGfx,
      alpha: { from: 0.3, to: 1 },
      duration: 300,
      yoyo: true,
      repeat: 2
    });
  }

  hasItem(itemId) {
    for (let r = 0; r < this.gridSize; r++) {
      for (let c = 0; c < this.gridSize; c++) {
        if (this.grid[r][c].item.id === itemId) return true;
      }
    }
    return false;
  }
}
