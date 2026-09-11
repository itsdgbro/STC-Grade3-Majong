/**
 * Crossword Generator
 * Selects 4 to 8 words from crossword_words.json and attempts to place them
 * in an intersecting crossword grid pattern.
 */

// Normalizes a string to uppercase English letters only
function cleanWord(str) {
  return str.replace(/[^A-Za-z]/g, '').toUpperCase();
}

/**
 * Generates an intersecting crossword layout.
 * @param {Array<{id: number, word: string, clue: string}>} allWordsPool
 * @param {number} targetWordCount - e.g. between 4 and 8
 * @returns {Object|null} crossword configuration
 */
export function generateCrosswordPuzzle(
  allWordsPool,
  targetWordCount = 5,
  excludeIds = new Set(),
  learningOptions = {}
) {
  if (!allWordsPool || allWordsPool.length === 0) return null;

  const {
    priorityWordIds = new Set(), // Failed words from previous rounds (asked again with high priority)
    masteredWordIds = new Set()  // Words solved with few/no errors (spawned much less often)
  } = learningOptions;

  // Filter valid words: 3 to 8 characters length and deduplicate by clean word
  const seenClean = new Set();
  const eligible = [];
  allWordsPool.forEach((item) => {
    const clean = cleanWord(item.word);
    if (clean.length >= 3 && clean.length <= 8 && !seenClean.has(clean)) {
      seenClean.add(clean);
      eligible.push({
        id: item.id,
        originalWord: item.word,
        clean,
        clue: item.clue
      });
    }
  });

  if (eligible.length === 0) return null;

  // 1. Priority Candidates: Failed words that must be asked again
  const priorityCandidates = eligible.filter((item) => priorityWordIds.has(item.id));

  // 2. Standard Candidates: Fresh words that haven't been mastered yet
  const standardFresh = eligible.filter(
    (item) => !priorityWordIds.has(item.id) && !masteredWordIds.has(item.id) && !excludeIds.has(item.id)
  );

  // 3. Recycled Standard: All unmastered words (if fresh pool gets low)
  const standardRecycled = eligible.filter(
    (item) => !priorityWordIds.has(item.id) && !masteredWordIds.has(item.id)
  );

  // 4. Mastered Candidates: Words solved with little/no error (deprioritized / spawned less)
  const masteredCandidates = eligible.filter((item) => masteredWordIds.has(item.id));

  const standardPool =
    standardFresh.length >= targetWordCount
      ? standardFresh
      : standardRecycled.length > 0
        ? standardRecycled
        : eligible;

  const MAX_ATTEMPTS = 70;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    // Put failed/priority words first so they have the highest chance to be placed
    const shuffledPriority = [...priorityCandidates].sort(() => Math.random() - 0.5);
    const shuffledStandard = [...standardPool].sort(() => Math.random() - 0.5);

    // Only inject mastered words with small chance (15%) or when standard pool is depleted
    const includeMastered = standardPool.length < targetWordCount || Math.random() < 0.15;
    const sampledMastered = includeMastered
      ? [...masteredCandidates].sort(() => Math.random() - 0.5).slice(0, 2)
      : [];

    const candidateSubset = [
      ...shuffledPriority,
      ...shuffledStandard,
      ...sampledMastered
    ].slice(0, Math.min(targetWordCount + 14, eligible.length));

    // For attempts, alternate prioritizing a failed word as the starting anchor
    if (shuffledPriority.length > 0 && attempt % 2 === 0) {
      const anchor = shuffledPriority[attempt % shuffledPriority.length];
      const rest = candidateSubset.filter((c) => c.id !== anchor.id);
      candidateSubset.splice(0, candidateSubset.length, anchor, ...rest);
    }

    const result = buildCrosswordLayout(candidateSubset, targetWordCount);
    if (result && result.words.length >= Math.min(3, targetWordCount)) {
      // If we have priority failed words, make sure at least one is included in the layout
      if (priorityCandidates.length > 0 && attempt < 50) {
        const hasPriority = result.words.some((w) => priorityWordIds.has(w.id));
        if (!hasPriority) {
          continue; // Try again to prioritize placing the failed word
        }
      }
      return result;
    }
  }

  // Fallback: Pick candidate words with failed words placed first
  const fallbackCandidates = [
    ...priorityCandidates,
    ...standardPool
  ].slice(0, Math.min(targetWordCount, 5));
  return createFallbackLayout(fallbackCandidates);
}

function buildCrosswordLayout(candidates, targetWordCount) {
  const placedWords = [];
  const grid = new Map(); // key: "r,c" -> char

  // Place first word horizontally at 0,0
  const first = candidates[0];
  for (let i = 0; i < first.clean.length; i++) {
    grid.set(`0,${i}`, first.clean[i]);
  }
  placedWords.push({
    ...first,
    uid: `${first.clean}-0`,
    startRow: 0,
    startCol: 0,
    direction: 'across', // 'across' (horizontal) or 'down' (vertical)
    length: first.clean.length
  });

  const remaining = candidates.slice(1);

  while (placedWords.length < targetWordCount && remaining.length > 0) {
    let bestPlacement = null;

    // Search for a word that can intersect with already placed words
    for (let i = 0; i < remaining.length; i++) {
      const cand = remaining[i];
      const placements = findValidPlacements(cand, placedWords, grid);
      if (placements.length > 0) {
        // Pick a random valid placement
        const chosen = placements[Math.floor(Math.random() * placements.length)];
        bestPlacement = { candIndex: i, placement: chosen };
        break;
      }
    }

    if (!bestPlacement) {
      break; // No further intersections found
    }

    const { candIndex, placement } = bestPlacement;
    const wordObj = remaining[candIndex];
    remaining.splice(candIndex, 1);

    // Commit to grid
    const { startRow, startCol, direction } = placement;
    for (let c = 0; c < wordObj.clean.length; c++) {
      const r = direction === 'across' ? startRow : startRow + c;
      const col = direction === 'across' ? startCol + c : startCol;
      grid.set(`${r},${col}`, wordObj.clean[c]);
    }

    placedWords.push({
      ...wordObj,
      uid: `${wordObj.clean}-${placedWords.length}`,
      startRow,
      startCol,
      direction,
      length: wordObj.clean.length
    });
  }

  if (placedWords.length < 3) return null;

  // Calculate bounding box
  let minR = Infinity, maxR = -Infinity, minC = Infinity, maxC = -Infinity;
  grid.forEach((_, key) => {
    const [r, c] = key.split(',').map(Number);
    if (r < minR) minR = r;
    if (r > maxR) maxR = r;
    if (c < minC) minC = c;
    if (c > maxC) maxC = c;
  });

  // Shift to 0-based coordinates
  const rows = maxR - minR + 1;
  const cols = maxC - minC + 1;

  // Ensure grid isn't excessively huge (compact layout limit for portrait screen)
  if (rows > 8 || cols > 8) return null;

  const normalizedWords = placedWords.map(w => ({
    ...w,
    startRow: w.startRow - minR,
    startCol: w.startCol - minC
  }));

  // Create 2D grid matrix
  const matrix = Array.from({ length: rows }, () => Array(cols).fill(null));
  grid.forEach((char, key) => {
    const [r, c] = key.split(',').map(Number);
    matrix[r - minR][c - minC] = char;
  });

  // Number the words (crossword standard: starting cells get 1, 2, 3...)
  let currentNum = 1;
  const cellNumbers = {};
  // Sort words by startRow then startCol
  normalizedWords.sort((a, b) => a.startRow - b.startRow || a.startCol - b.startCol);

  normalizedWords.forEach(w => {
    const key = `${w.startRow},${w.startCol}`;
    if (!cellNumbers[key]) {
      cellNumbers[key] = currentNum++;
    }
    w.number = cellNumbers[key];
  });

  // Collect letter frequency pool for the wheel
  const lettersPool = extractLetterPool(normalizedWords);

  return {
    rows,
    cols,
    matrix,
    words: normalizedWords,
    cellNumbers,
    lettersPool
  };
}

/**
 * Finds all legal intersections for `cand` against currently placed words and grid.
 */
function findValidPlacements(cand, placedWords, grid) {
  const valid = [];

  for (const placed of placedWords) {
    const targetDir = placed.direction === 'across' ? 'down' : 'across';

    for (let i = 0; i < cand.clean.length; i++) {
      const char = cand.clean[i];

      for (let j = 0; j < placed.clean.length; j++) {
        if (placed.clean[j] === char) {
          // Intersection candidate: cand[i] aligns with placed[j]
          const intersectionR = placed.direction === 'across' ? placed.startRow : placed.startRow + j;
          const intersectionC = placed.direction === 'across' ? placed.startCol + j : placed.startCol;

          const startRow = targetDir === 'across' ? intersectionR : intersectionR - i;
          const startCol = targetDir === 'across' ? intersectionC - i : intersectionC;

          if (canPlaceWord(cand.clean, startRow, startCol, targetDir, grid)) {
            valid.push({ startRow, startCol, direction: targetDir });
          }
        }
      }
    }
  }

  return valid;
}

/**
 * Validates crossword placement rules:
 * - Cells before start and after end must be empty (no word lengthening).
 * - Matching letters on intersection.
 * - Parallel adjacent cells cannot touch unless intersecting.
 */
function canPlaceWord(wordStr, startRow, startCol, direction, grid) {
  const len = wordStr.length;

  // Check head & tail borders
  if (direction === 'across') {
    if (grid.has(`${startRow},${startCol - 1}`)) return false;
    if (grid.has(`${startRow},${startCol + len}`)) return false;
  } else {
    if (grid.has(`${startRow - 1},${startCol}`)) return false;
    if (grid.has(`${startRow + len},${startCol}`)) return false;
  }

  let hasIntersection = false;

  for (let step = 0; step < len; step++) {
    const r = direction === 'across' ? startRow : startRow + step;
    const c = direction === 'across' ? startCol + step : startCol;
    const key = `${r},${c}`;

    if (grid.has(key)) {
      if (grid.get(key) !== wordStr[step]) {
        return false; // Letter clash
      }
      hasIntersection = true;
    } else {
      // Adjacent check: cannot be immediately adjacent to another word parallel
      if (direction === 'across') {
        if (grid.has(`${r - 1},${c}`) || grid.has(`${r + 1},${c}`)) return false;
      } else {
        if (grid.has(`${r},${c - 1}`) || grid.has(`${r},${c + 1}`)) return false;
      }
    }
  }

  return hasIntersection;
}

/**
 * Creates letter counts necessary to spell the words.
 * To make the Wordscapes wheel enjoyable, we calculate the max count needed
 * for each letter across all the words in the puzzle.
 */
function extractLetterPool(words) {
  const maxCounts = {};
  words.forEach(w => {
    const localCount = {};
    for (const ch of w.clean) {
      localCount[ch] = (localCount[ch] || 0) + 1;
    }
    for (const [ch, cnt] of Object.entries(localCount)) {
      maxCounts[ch] = Math.max(maxCounts[ch] || 0, cnt);
    }
  });

  const pool = [];
  for (const [ch, cnt] of Object.entries(maxCounts)) {
    for (let i = 0; i < cnt; i++) {
      pool.push(ch);
    }
  }

  // Shuffle pool
  return pool.sort(() => Math.random() - 0.5);
}

/**
 * Deterministic fallback layout in case random intersecting fails
 */
function createFallbackLayout(words) {
  const safeWords = words.slice(0, Math.min(words.length, 5));
  const maxLen = Math.max(8, ...safeWords.map((w) => w.clean.length));
  const rows = safeWords.length * 2;
  const cols = maxLen;
  const matrix = Array.from({ length: rows }, () => Array(cols).fill(null));

  const placed = safeWords.map((w, idx) => {
    const startRow = idx * 2;
    const startCol = 0;
    for (let i = 0; i < w.clean.length; i++) {
      matrix[startRow][startCol + i] = w.clean[i];
    }
    return {
      ...w,
      startRow,
      startCol,
      direction: 'across',
      length: w.clean.length,
      number: idx + 1
    };
  });

  const cellNumbers = {};
  placed.forEach(w => {
    cellNumbers[`${w.startRow},${w.startCol}`] = w.number;
  });

  return {
    rows,
    cols,
    matrix,
    words: placed,
    cellNumbers,
    lettersPool: extractLetterPool(placed)
  };
}
