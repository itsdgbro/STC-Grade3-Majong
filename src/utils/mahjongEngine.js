/**
 * Enhanced Mahjong Solitaire Engine with Guaranteed-Solvable Generation & Validation
 */

/**
 * Checks if a specific tile is free / selectable among the currently active (unmatched) tiles.
 * Strict Mahjong Solitaire Rule:
 * 1. Must NOT be covered by any tile on a higher layer (z' > z) overlapping in 2D space.
 * 2. Must have at least one side (Left OR Right) open on the same layer.
 */
export function isTileFree(tile, activeTiles) {
  if (!tile) return false;

  let coveredAbove = false;
  let blockedLeft = false;
  let blockedRight = false;

  for (let i = 0; i < activeTiles.length; i++) {
    const other = activeTiles[i];
    if (other.id === tile.id) continue;

    // Check higher layer overlap: 2D bounding box test
    if (other.z > tile.z) {
      if (Math.abs(other.x - tile.x) < 2 && Math.abs(other.y - tile.y) < 2) {
        coveredAbove = true;
        break;
      }
    }

    // Check same layer left/right neighbors
    if (other.z === tile.z) {
      if (other.x === tile.x - 2 && Math.abs(other.y - tile.y) < 2) {
        blockedLeft = true;
      }
      if (other.x === tile.x + 2 && Math.abs(other.y - tile.y) < 2) {
        blockedRight = true;
      }
    }
  }

  if (coveredAbove) return false;
  return !blockedLeft || !blockedRight;
}

/**
 * Returns all currently free tiles.
 */
export function getFreeTiles(activeTiles) {
  return activeTiles.filter((t) => isTileFree(t, activeTiles));
}

/**
 * Finds all valid matching free pairs available right now on the board.
 */
export function getAvailableFreePairs(activeTiles) {
  const free = getFreeTiles(activeTiles);
  const freePairs = [];

  for (let i = 0; i < free.length; i++) {
    for (let j = i + 1; j < free.length; j++) {
      if (free[i].pairId === free[j].pairId) {
        freePairs.push([free[i], free[j]]);
      }
    }
  }

  return freePairs;
}

/**
 * Exhaustive Backtracking Solver to verify if an active board state can be completely solved.
 */
export function solvePuzzle(initialTiles) {
  function search(currentActive) {
    if (currentActive.length === 0) return true;

    const pairs = getAvailableFreePairs(currentActive);
    if (pairs.length === 0) return false;

    for (let p of pairs) {
      const nextActive = currentActive.filter(
        (t) => t.id !== p[0].id && t.id !== p[1].id
      );
      if (search(nextActive)) {
        return true;
      }
    }

    return false;
  }

  return search(initialTiles);
}

/**
 * Finds the best Hint move from the current active tiles that leads to a winning branch.
 */
export function findSolvableHint(activeTiles) {
  const pairs = getAvailableFreePairs(activeTiles);
  if (pairs.length === 0) return null;

  for (let p of pairs) {
    const nextActive = activeTiles.filter(
      (t) => t.id !== p[0].id && t.id !== p[1].id
    );
    if (solvePuzzle(nextActive)) {
      return p;
    }
  }

  return pairs[0];
}

// Built-in 3D Mahjong Solitaire Layout Templates
export const BUILTIN_LAYOUTS = {
  // 4-Tile Session Layout (2 pairs: 2x2 grid)
  session_4: [
    { x: 0, y: 1, z: 0 }, { x: 2, y: 1, z: 0 },
    { x: 0, y: 3, z: 0 }, { x: 2, y: 3, z: 0 }
  ],
  // 6-Tile Session Layout (3 pairs: 2x3 grid where 4 outer tiles are free and 2 center tiles are locked between them)
  session_6: [
    { x: 0, y: 1, z: 0 }, { x: 2, y: 1, z: 0 }, { x: 4, y: 1, z: 0 },
    { x: 0, y: 3, z: 0 }, { x: 2, y: 3, z: 0 }, { x: 4, y: 3, z: 0 }
  ],
  // 8-Tile Session Layout (4 pairs: 2x4 grid)
  session_8: [
    { x: 0, y: 1, z: 0 }, { x: 2, y: 1, z: 0 }, { x: 4, y: 1, z: 0 }, { x: 6, y: 1, z: 0 },
    { x: 0, y: 3, z: 0 }, { x: 2, y: 3, z: 0 }, { x: 4, y: 3, z: 0 }, { x: 6, y: 3, z: 0 }
  ],
  // 12-Tile Gentle Starter (6 pairs - 2 layers)
  starter_12: [
    { x: 0, y: 1, z: 0 }, { x: 8, y: 1, z: 0 },
    { x: 2, y: 1, z: 0 }, { x: 4, y: 1, z: 0 }, { x: 6, y: 1, z: 0 },
    { x: 0, y: 3, z: 0 }, { x: 8, y: 3, z: 0 },
    { x: 2, y: 3, z: 0 }, { x: 4, y: 3, z: 0 }, { x: 6, y: 3, z: 0 },
    { x: 3, y: 2, z: 1 }, { x: 5, y: 2, z: 1 }
  ],
  // 16-Tile Cross (8 pairs - 2 layers)
  cross_16: [
    { x: 4, y: 0, z: 0 },
    { x: 0, y: 2, z: 0 }, { x: 2, y: 2, z: 0 }, { x: 4, y: 2, z: 0 }, { x: 6, y: 2, z: 0 }, { x: 8, y: 2, z: 0 },
    { x: 0, y: 4, z: 0 }, { x: 2, y: 4, z: 0 }, { x: 4, y: 4, z: 0 }, { x: 6, y: 4, z: 0 }, { x: 8, y: 4, z: 0 },
    { x: 4, y: 6, z: 0 },
    { x: 3, y: 2, z: 1 }, { x: 5, y: 2, z: 1 },
    { x: 3, y: 4, z: 1 }, { x: 5, y: 4, z: 1 }
  ],
  // 20-Tile Bridge (10 pairs - 2 layers)
  bridge_20: [
    { x: 0, y: 0, z: 0 }, { x: 8, y: 0, z: 0 },
    { x: 0, y: 2, z: 0 }, { x: 2, y: 2, z: 0 }, { x: 4, y: 2, z: 0 }, { x: 6, y: 2, z: 0 }, { x: 8, y: 2, z: 0 },
    { x: 0, y: 4, z: 0 }, { x: 2, y: 4, z: 0 }, { x: 4, y: 4, z: 0 }, { x: 6, y: 4, z: 0 }, { x: 8, y: 4, z: 0 },
    { x: 0, y: 6, z: 0 }, { x: 8, y: 6, z: 0 },
    { x: 4, y: 0, z: 0 }, { x: 4, y: 6, z: 0 },
    { x: 2, y: 3, z: 1 }, { x: 4, y: 3, z: 1 }, { x: 6, y: 3, z: 1 },
    { x: 4, y: 1, z: 1 }
  ],
  // 24-Tile Pagoda (12 pairs - 3 layers)
  pagoda_24: [
    { x: 0, y: 3, z: 0 }, { x: 2, y: 3, z: 0 }, { x: 4, y: 3, z: 0 }, { x: 6, y: 3, z: 0 }, { x: 8, y: 3, z: 0 },
    { x: 0, y: 1, z: 0 }, { x: 8, y: 1, z: 0 },
    { x: 0, y: 5, z: 0 }, { x: 8, y: 5, z: 0 },
    { x: 2, y: 1, z: 0 }, { x: 6, y: 1, z: 0 },
    { x: 2, y: 5, z: 0 }, { x: 6, y: 5, z: 0 },
    { x: 4, y: 1, z: 0 },
    { x: 2, y: 2, z: 1 }, { x: 4, y: 2, z: 1 }, { x: 6, y: 2, z: 1 },
    { x: 2, y: 4, z: 1 }, { x: 4, y: 4, z: 1 }, { x: 6, y: 4, z: 1 },
    { x: 4, y: 0, z: 1 }, { x: 4, y: 6, z: 1 },
    { x: 3, y: 3, z: 2 }, { x: 5, y: 3, z: 2 }
  ],
  // 28-Tile Mystic Dragon (14 pairs - 3 layers)
  dragon_28: [
    { x: 0, y: 0, z: 0 }, { x: 8, y: 0, z: 0 },
    { x: 2, y: 1, z: 0 }, { x: 6, y: 1, z: 0 },
    { x: 0, y: 2, z: 0 }, { x: 2, y: 2, z: 0 }, { x: 4, y: 2, z: 0 }, { x: 6, y: 2, z: 0 }, { x: 8, y: 2, z: 0 },
    { x: 0, y: 4, z: 0 }, { x: 2, y: 4, z: 0 }, { x: 4, y: 4, z: 0 }, { x: 6, y: 4, z: 0 }, { x: 8, y: 4, z: 0 },
    { x: 2, y: 5, z: 0 }, { x: 6, y: 5, z: 0 },
    { x: 0, y: 6, z: 0 }, { x: 8, y: 6, z: 0 },
    { x: 2, y: 3, z: 1 }, { x: 6, y: 3, z: 1 },
    { x: 4, y: 1, z: 1 }, { x: 4, y: 5, z: 1 },
    { x: 3, y: 2, z: 1 }, { x: 5, y: 2, z: 1 },
    { x: 3, y: 4, z: 1 }, { x: 5, y: 4, z: 1 },
    { x: 4, y: 2, z: 2 }, { x: 4, y: 4, z: 2 }
  ]
};

/**
 * Returns an appropriate built-in layout template based on the requested number of pairs.
 */
export function getLayoutForPairs(pairCount = 3) {
  if (pairCount <= 2) return BUILTIN_LAYOUTS.session_4;
  if (pairCount === 3) return BUILTIN_LAYOUTS.session_6;
  if (pairCount === 4 || pairCount === 5) return BUILTIN_LAYOUTS.session_8;
  if (pairCount === 6 || pairCount === 7) return BUILTIN_LAYOUTS.starter_12;
  if (pairCount >= 8 && pairCount <= 9) return BUILTIN_LAYOUTS.cross_16;
  if (pairCount >= 10 && pairCount <= 11) return BUILTIN_LAYOUTS.bridge_20;
  if (pairCount >= 12 && pairCount <= 13) return BUILTIN_LAYOUTS.pagoda_24;
  return BUILTIN_LAYOUTS.dragon_28;
}

/**
 * Returns an appropriate built-in layout template based on levelData or fallback.
 */
export function getLayoutForLevel(levelData, levelIdx = 0) {
  if (levelData?.layout && Array.isArray(levelData.layout) && levelData.layout.length >= 4) {
    return levelData.layout;
  }

  const pool = levelData?.vocabularyPool || levelData?.questions || [];
  return getLayoutForPairs(pool.length);
}

/**
 * Solution-First Puzzle Generator:
 * Generates and validates until finding a verified 100% solvable board.
 */
export function generateSolutionFirstPuzzle(layoutSlots, vocabularyPool, levelIdx = 0) {
  const pool = Array.isArray(vocabularyPool) ? vocabularyPool : [];
  if (pool.length === 0) {
    throw new Error('vocabularyPool or questions array cannot be empty');
  }

  const slots = (layoutSlots && Array.isArray(layoutSlots) && layoutSlots.length > 0)
    ? layoutSlots
    : getLayoutForLevel({ vocabularyPool: pool }, levelIdx);

  const slotCount = slots.length;
  if (slotCount % 2 !== 0) {
    throw new Error(`Mahjong layout slots count must be even (${slotCount})`);
  }

  const numPairsNeeded = slotCount / 2;

  while (true) {
    // 1. Pick unique vocabulary pairs from the pool
    const shuffledVocab = [...pool].sort(() => Math.random() - 0.5);
    const chosenPairs = [];
    for (let i = 0; i < numPairsNeeded; i++) {
      chosenPairs.push(shuffledVocab[i % shuffledVocab.length]);
    }

    // 2. Track remaining slots on the board
    let simulatedBoard = slots.map((s, idx) => ({
      slotId: `slot_${idx}_${s.x}_${s.y}_${s.z}`,
      x: s.x,
      y: s.y,
      z: s.z
    }));

    const assignedTiles = [];
    let sequenceSuccess = true;

    // 3. Step-by-step removal simulation
    for (let step = 0; step < numPairsNeeded; step++) {
      const freeSlots = getFreeTiles(simulatedBoard);
      if (freeSlots.length < 2) {
        sequenceSuccess = false;
        break;
      }

      // Pick 2 free slots
      const shuffledFree = [...freeSlots].sort(() => Math.random() - 0.5);
      const slotA = shuffledFree[0];
      const slotB = shuffledFree[1];

      const vocab = chosenPairs[step];
      const flip = Math.random() > 0.5;

      const v1Word = vocab.word1 || '';
      const v1Icon = vocab.icon1 || '';
      const v2Word = vocab.word2 || '';
      const v2Icon = vocab.icon2 || '';

      const isV1Image = typeof v1Icon === 'string' && (
        v1Icon.includes('drive.google.com') ||
        v1Icon.includes('googleusercontent.com') ||
        v1Icon.startsWith('http://') ||
        v1Icon.startsWith('https://') ||
        v1Icon.startsWith('data:image/') ||
        /\.(png|jpe?g|svg|webp|gif|avif)$/i.test(v1Icon)
      );

      const isV2Image = typeof v2Icon === 'string' && (
        v2Icon.includes('drive.google.com') ||
        v2Icon.includes('googleusercontent.com') ||
        v2Icon.startsWith('http://') ||
        v2Icon.startsWith('https://') ||
        v2Icon.startsWith('data:image/') ||
        /\.(png|jpe?g|svg|webp|gif|avif)$/i.test(v2Icon)
      );

      // Match the following: If one is an image, image tile has NO text (word: ''), and text tile has NO image/icon (icon: '')
      let tileAWord = flip ? v1Word : v2Word;
      let tileAIcon = flip ? v1Icon : v2Icon;
      let tileBWord = flip ? v2Word : v1Word;
      let tileBIcon = flip ? v2Icon : v1Icon;

      if (isV1Image && (!v2Icon || !isV2Image)) {
        if (flip) {
          tileAWord = ''; // Image tile has image only (no text)
          tileBIcon = ''; // Word tile has text only (no image)
        } else {
          tileBWord = ''; // Image tile has image only (no text)
          tileAIcon = ''; // Word tile has text only (no image)
        }
      } else if (isV2Image && (!v1Icon || !isV1Image)) {
        if (flip) {
          tileBWord = ''; // Image tile has image only (no text)
          tileAIcon = ''; // Word tile has text only (no image)
        } else {
          tileAWord = ''; // Image tile has image only (no text)
          tileBIcon = ''; // Word tile has text only (no image)
        }
      }

      const tileA = {
        id: `tile_${slotA.slotId}`,
        x: slotA.x,
        y: slotA.y,
        z: slotA.z,
        pairId: `pair_${step}_${vocab.id}`,
        word: tileAWord,
        icon: tileAIcon,
        relation: vocab.relation,
        hint: vocab.hint || '',
        partnerWord: tileBWord || vocab.word1 || vocab.word2
      };

      const tileB = {
        id: `tile_${slotB.slotId}`,
        x: slotB.x,
        y: slotB.y,
        z: slotB.z,
        pairId: `pair_${step}_${vocab.id}`,
        word: tileBWord,
        icon: tileBIcon,
        relation: vocab.relation,
        hint: vocab.hint || '',
        partnerWord: tileAWord || vocab.word1 || vocab.word2
      };

      assignedTiles.push(tileA, tileB);

      // Remove from simulation
      simulatedBoard = simulatedBoard.filter(
        (s) => s.slotId !== slotA.slotId && s.slotId !== slotB.slotId
      );
    }

    // 4. Validate complete board with solver
    if (sequenceSuccess && assignedTiles.length === slotCount) {
      if (solvePuzzle(assignedTiles)) {
        return assignedTiles;
      }
    }
  }
}
