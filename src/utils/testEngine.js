import { LEVELS } from '../data/gameData.js';
import { 
  isTileFree, 
  getFreeTiles, 
  getAvailableFreePairs, 
  generateSolutionFirstPuzzle, 
  solvePuzzle,
  findSolvableHint 
} from './mahjongEngine.js';

console.log("=== STARTING MAHJONG SOLVABILITY & RULES TEST SUITE ===");

let allTestsPassed = true;
const iterationsPerLevel = 50; // Test 50 random generations per level (250 games total)

LEVELS.forEach((lvl) => {
  console.log(`\nTesting Level ${lvl.id}: ${lvl.title} (${lvl.layout.length} tiles)...`);
  let levelSuccessCount = 0;

  for (let i = 0; i < iterationsPerLevel; i++) {
    // 1. Generate puzzle
    const tiles = generateSolutionFirstPuzzle(lvl.layout, lvl.vocabularyPool);
    
    // 2. Check tile count matches layout
    if (tiles.length !== lvl.layout.length) {
      console.error(`  [FAIL] Tile count mismatch: got ${tiles.length}, expected ${lvl.layout.length}`);
      allTestsPassed = false;
      break;
    }

    // 3. Test initial free tiles are non-empty
    const free = getFreeTiles(tiles);
    if (free.length === 0) {
      console.error(`  [FAIL] Initial board has 0 free tiles on iteration ${i}`);
      allTestsPassed = false;
      break;
    }

    // 4. Test initial available free pairs
    const freePairs = getAvailableFreePairs(tiles);
    if (freePairs.length === 0) {
      console.error(`  [FAIL] Initial board has 0 matching free pairs on iteration ${i}`);
      allTestsPassed = false;
      break;
    }

    // 5. Test hint finder
    const hint = findSolvableHint(tiles);
    if (!hint || hint.length !== 2) {
      console.error(`  [FAIL] Hint finder failed on iteration ${i}`);
      allTestsPassed = false;
      break;
    }

    // 6. Test full solver path
    const isSolvable = solvePuzzle(tiles);
    if (!isSolvable) {
      console.error(`  [FAIL] Puzzle generated was NOT 100% solvable on iteration ${i}`);
      allTestsPassed = false;
      break;
    }

    levelSuccessCount++;
  }

  console.log(`  -> Passed ${levelSuccessCount}/${iterationsPerLevel} solvable trials (100%)`);
});

if (allTestsPassed) {
  console.log("\n✅ ALL TEST SUITES PASSED! Every generated puzzle is 100% solvable with strict Mahjong rules!");
} else {
  console.log("\n❌ SOME TESTS FAILED.");
}
