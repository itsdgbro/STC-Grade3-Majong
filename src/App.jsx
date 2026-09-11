import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AspectRatioContainer } from './components/AspectRatioContainer';
import { HimalayanBackground } from './components/HimalayanBackground';
import { MainMenu } from './components/MainMenu';
import { HowToPlayModal } from './components/HowToPlayModal';
import { SettingsModal } from './components/SettingsModal';
import { PauseModal } from './components/PauseModal';
import { GlobalTopBar } from './components/GlobalTopBar';
import { Tile } from './components/Tile';
import { Mascot } from './components/Mascot';
import { VictoryModal } from './components/VictoryModal';
import { LEVELS as DEFAULT_LEVELS } from './data/gameData';
import { loadGameLevels } from './utils/dataLoader';
import {
  getFreeTiles,
  getAvailableFreePairs,
  generateSolutionFirstPuzzle,
  findSolvableHint,
  getLayoutForPairs
} from './utils/mahjongEngine';
import { GAME_CONFIG } from './data/gameConfig';
import { audio } from './utils/audio';
import { formatTime } from './utils/timeFormatter';
import { flutterBridge } from './utils/flutterBridge';
import { BridgeDebugOverlay } from './components/BridgeDebugOverlay';

const TOTAL_ROUNDS = GAME_CONFIG.TOTAL_ROUNDS || 3;
const PAIRS_PER_ROUND = GAME_CONFIG.PAIRS_PER_ROUND || 3;

export default function App() {
  // Navigation Scene State: 'MENU' | 'GAME'
  const [scene, setScene] = useState('MENU');
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPause, setShowPause] = useState(false);

  // Levels data (single-level architecture)
  const [levels, setLevels] = useState(DEFAULT_LEVELS);

  // Round & Learning Personalization State
  const [round, setRound] = useState(1);
  const [failedQuestionIds, setFailedQuestionIds] = useState(new Set());
  const [retriedQuestionIds, setRetriedQuestionIds] = useState(new Set());
  const [masteredQuestionIds, setMasteredQuestionIds] = useState(new Set());
  const [usedQuestionIds, setUsedQuestionIds] = useState(new Set());
  const [roundTransitionBanner, setRoundTransitionBanner] = useState(null); // e.g. "Round 2"

  // Gameplay state
  const [tiles, setTiles] = useState([]);
  const [selectedTileId, setSelectedTileId] = useState(null);
  const [hintedPairIds, setHintedPairIds] = useState([]);
  const [mismatchedIds, setMismatchedIds] = useState([]);
  const [matchedIds, setMatchedIds] = useState([]);
  const [justUnlockedIds, setJustUnlockedIds] = useState([]);
  const [moveHistory, setMoveHistory] = useState([]);
  const [score, setScore] = useState(0);
  const [xp, setXp] = useState(0);
  const [hintsRemaining, setHintsRemaining] = useState(3);
  const [mascotTip, setMascotTip] = useState('');
  const [mascotMood, setMascotMood] = useState('happy');
  const [isVictory, setIsVictory] = useState(false);
  const [victoryStats, setVictoryStats] = useState({ stars: 3, timeBonus: 0, finalScore: 0, finalXp: 0 });
  const [timer, setTimer] = useState(0);
  const [isGameActive, setIsGameActive] = useState(false);

  // Audio state
  const [sfxVolume, setSfxVolume] = useState(0.8);
  const [sfxMuted, setSfxMuted] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.5);
  const [musicMuted, setMusicMuted] = useState(false);
  const [speechVolume, setSpeechVolume] = useState(0.7);
  const [speechMuted, setSpeechMuted] = useState(false);

  // Flutter Bridge Debug Overlay state (auto-enabled if ?debug_bridge=true in URL)
  const [showBridgeDebug, setShowBridgeDebug] = useState(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('debug_bridge') === 'true';
    } catch (e) {
      return false;
    }
  });

  // Load levels dynamically on mount and expose window.loadGameData
  useEffect(() => {
    loadGameLevels().then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        setLevels(data);
      }
    });

    window.loadGameData = (customLevels) => {
      if (Array.isArray(customLevels) && customLevels.length > 0) {
        console.log('[App] Custom levels dynamically set via window.loadGameData');
        setLevels(customLevels);
      }
    };

    return () => {
      delete window.loadGameData;
    };
  }, []);

  const level = levels[0] || DEFAULT_LEVELS[0];

  // Active (unmatched) tiles
  const activeTiles = useMemo(() => {
    return tiles.filter((t) => !matchedIds.includes(t.id));
  }, [tiles, matchedIds]);

  // Set of free tile IDs computed via Mahjong Solitaire rules
  const freeTileIds = useMemo(() => {
    const free = getFreeTiles(activeTiles);
    return new Set(free.map((t) => t.id));
  }, [activeTiles]);

  // Available free matching pairs
  const availableFreePairs = useMemo(() => {
    return getAvailableFreePairs(activeTiles);
  }, [activeTiles]);

  /**
   * Selects 3 question pairs for the round with learning personalization.
   * Priority:
   * 1. Questions that were failed in a previous round and haven't been retried yet.
   * 2. Fresh questions from the pool that haven't been answered yet.
   * 3. Any questions in pool if all have been used.
   */
  const selectQuestionsForRound = useCallback((currentFailed, currentRetried, currentUsed, pool) => {
    const chosenQuestions = [];
    const newRetried = new Set(currentRetried);
    const newUsed = new Set(currentUsed);

    // 1. Check for pending retries (questions failed but not yet retried)
    const pendingRetryIds = Array.from(currentFailed).filter((id) => !currentRetried.has(id));
    for (const qId of pendingRetryIds) {
      if (chosenQuestions.length >= PAIRS_PER_ROUND) break;
      const found = pool.find((q) => q.id === qId);
      if (found) {
        chosenQuestions.push(found);
        newRetried.add(qId);
      }
    }

    // 2. Fill remaining quota with fresh unused questions
    const unusedQuestions = pool.filter(
      (q) => !newUsed.has(q.id) && !chosenQuestions.some((cq) => cq.id === q.id)
    );
    const shuffledUnused = [...unusedQuestions].sort(() => Math.random() - 0.5);

    for (const q of shuffledUnused) {
      if (chosenQuestions.length >= PAIRS_PER_ROUND) break;
      chosenQuestions.push(q);
      newUsed.add(q.id);
    }

    // 3. Fallback: if pool exhausted, fill from anywhere in pool
    if (chosenQuestions.length < PAIRS_PER_ROUND) {
      const remainingPool = pool.filter((q) => !chosenQuestions.some((cq) => cq.id === q.id));
      const shuffledRest = [...remainingPool].sort(() => Math.random() - 0.5);
      for (const q of shuffledRest) {
        if (chosenQuestions.length >= PAIRS_PER_ROUND) break;
        chosenQuestions.push(q);
      }
    }

    return {
      selectedQuestions: chosenQuestions,
      updatedRetried: newRetried,
      updatedUsed: newUsed
    };
  }, []);

  /**
   * Start a round (session)
   */
  const startRound = useCallback((targetRound, isNewGame = false) => {
    const activeLevel = levels[0] || DEFAULT_LEVELS[0];
    const fullPool = activeLevel.questions || activeLevel.vocabularyPool || [];

    let currentFailed = failedQuestionIds;
    let currentRetried = retriedQuestionIds;
    let currentUsed = usedQuestionIds;

    if (isNewGame) {
      currentFailed = new Set();
      currentRetried = new Set();
      currentUsed = new Set();
      setFailedQuestionIds(new Set());
      setRetriedQuestionIds(new Set());
      setMasteredQuestionIds(new Set());
      setUsedQuestionIds(new Set());
      setScore(0);
      setXp(0);
      setTimer(0);
    }

    // Select 3 adaptive questions
    const { selectedQuestions, updatedRetried, updatedUsed } = selectQuestionsForRound(
      currentFailed,
      currentRetried,
      currentUsed,
      fullPool
    );

    setRetriedQuestionIds(updatedRetried);
    setUsedQuestionIds(updatedUsed);

    // Dynamically retrieve the layout template configured for this number of pairs
    const currentLayout = getLayoutForPairs(PAIRS_PER_ROUND);

    // Generate guaranteed-solvable layout with exactly PAIRS_PER_ROUND pairs
    const generatedTiles = generateSolutionFirstPuzzle(
      currentLayout,
      selectedQuestions,
      0
    );

    setRound(targetRound);
    setTiles(generatedTiles);
    setSelectedTileId(null);
    setHintedPairIds([]);
    setMismatchedIds([]);
    setMatchedIds([]);
    setJustUnlockedIds([]);
    setMoveHistory([]);
    setMascotMood('happy');
    setHintsRemaining(3);
    setIsVictory(false);
    setIsGameActive(true);

    if (targetRound === 1) {
      setMascotTip(activeLevel.mascotTip || "Welcome! Match 3 pairs to clear Round 1!");
    } else {
      setMascotTip(`Round ${targetRound} of ${TOTAL_ROUNDS}! Look for open outer and top tiles! ✨`);
    }

    // Show temporary round announcement banner
    setRoundTransitionBanner(`Round ${targetRound} of ${TOTAL_ROUNDS}`);
    setTimeout(() => {
      setRoundTransitionBanner(null);
    }, 1500);

  }, [levels, failedQuestionIds, retriedQuestionIds, usedQuestionIds, selectQuestionsForRound]);

  /**
   * Start fresh game from Main Menu
   */
  const handleStartGame = () => {
    setScene('GAME');
    startRound(1, true);
  };

  // Initialize Flutter Bridge & register incoming Flutter commands
  useEffect(() => {
    flutterBridge.init({
      gameId: 'stc_grade3_mahjong',
      gameTitle: 'Grade 3 Vocabulary Mahjong',
      debug: Boolean(showBridgeDebug)
    });

    const unbindPause = flutterBridge.on('PAUSE', () => {
      setShowPause(true);
    });
    const unbindResume = flutterBridge.on('RESUME', () => {
      setShowPause(false);
    });
    const unbindRestart = flutterBridge.on('RESTART', () => {
      setShowPause(false);
      startRound(1, true);
    });

    return () => {
      unbindPause();
      unbindResume();
      unbindRestart();
    };
  }, [showBridgeDebug, startRound]);


  // Timer interval with AFK auto-pause safeguard
  useEffect(() => {
    let interval = null;
    let lastActivityTime = Date.now();

    const resetActivity = () => {
      lastActivityTime = Date.now();
    };

    window.addEventListener('pointerdown', resetActivity);
    window.addEventListener('keydown', resetActivity);

    if (isGameActive && !isVictory && !showPause && scene === 'GAME') {
      const afkTimeoutMs = (GAME_CONFIG.AFK_COOLDOWN_SECONDS || 30) * 1000;
      interval = setInterval(() => {
        if (Date.now() - lastActivityTime >= afkTimeoutMs) {
          setShowPause(true);
          return;
        }
        setTimer((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      clearInterval(interval);
      window.removeEventListener('pointerdown', resetActivity);
      window.removeEventListener('keydown', resetActivity);
    };
  }, [isGameActive, isVictory, showPause, scene]);

  // Handle Tile Selection & Learning Error Tracking
  const handleTileClick = (tile) => {
    // Strict Mahjong Check
    if (!freeTileIds.has(tile.id)) {
      audio.playMismatch();
      setMascotTip("That tile is trapped! Free the top or outer tiles first.");
      return;
    }

    // Pronounce English word (or partner word if image tile)
    const pronounceWord = tile.word || tile.partnerWord;
    if (pronounceWord) {
      audio.speakWord(pronounceWord);
    }

    // First tile selection
    if (!selectedTileId) {
      setSelectedTileId(tile.id);
      audio.playSelect();
      setHintedPairIds([]);
      if (tile.word) {
        setMascotTip(`You selected "${tile.word}"! Look for its matching picture!`);
      } else {
        setMascotTip(`Look for the matching word for this picture!`);
      }
      return;
    }

    // Deselect if clicking same tile
    if (selectedTileId === tile.id) {
      setSelectedTileId(null);
      return;
    }

    const firstTile = tiles.find((t) => t.id === selectedTileId);
    if (!firstTile) {
      setSelectedTileId(tile.id);
      return;
    }

    // Check English matching pair
    if (firstTile.pairId === tile.pairId) {
      const previousFree = new Set(freeTileIds);

      // Valid Match
      audio.playMatch();
      const newMatched = [...matchedIds, firstTile.id, tile.id];
      setMatchedIds(newMatched);
      setMoveHistory((prev) => [...prev, [firstTile.id, tile.id]]);
      setSelectedTileId(null);
      setHintedPairIds([]);
      setScore((prev) => prev + 100);
      setXp((prev) => prev + 100);
      setMascotMood('correct');

      // Extract raw question ID (e.g. from pair_0_e1 -> e1)
      const rawQuestionId = tile.pairId.replace(/^pair_\d+_/, '');

      // Check if this was a previously failed/retried question that is now mastered!
      let wasRetry = false;
      if (failedQuestionIds.has(rawQuestionId)) {
        wasRetry = true;
        setFailedQuestionIds((prev) => {
          const next = new Set(prev);
          next.delete(rawQuestionId);
          return next;
        });
        setMasteredQuestionIds((prev) => {
          const next = new Set(prev);
          next.add(rawQuestionId);
          return next;
        });
      }

      // Calculate newly uncovered tiles
      const nextActiveTiles = tiles.filter((t) => !newMatched.includes(t.id));
      const nextFreeTiles = getFreeTiles(nextActiveTiles);
      const newlyFreed = nextFreeTiles
        .filter((t) => !previousFree.has(t.id))
        .map((t) => t.id);

      const pairName = (firstTile.word || firstTile.partnerWord || tile.word || tile.partnerWord);
      const educationalHint = firstTile.hint || tile.hint;
      
      if (wasRetry) {
        setMascotMood('celebrating');
        if (educationalHint) {
          setMascotTip(`🌟 Mastered "${pairName}"! (+100 XP) 💡 ${educationalHint}`);
        } else {
          setMascotTip(`🌟 Amazing mastery! You solved "${pairName}" correctly! (+100 XP)`);
        }
        audio.speakWord(`Great job! You mastered ${pairName}! ${educationalHint || ''}`);
      } else if (newlyFreed.length > 0) {
        setJustUnlockedIds(newlyFreed);
        setTimeout(() => setJustUnlockedIds([]), 900);
        if (educationalHint) {
          setMascotTip(`✨ "${pairName}" matched! (+100 XP) 💡 ${educationalHint}`);
        } else {
          setMascotTip(`Brilliant! "${pairName}" matched! (+100 XP) ✨`);
        }
        audio.speakWord(`${pairName}. ${educationalHint || ''}`);
      } else {
        if (educationalHint) {
          setMascotTip(`✨ "${pairName}" matched! (+100 XP) 💡 ${educationalHint}`);
        } else {
          setMascotTip(`Superb! "${pairName}" is a correct match! (+100 XP) ✨`);
        }
        audio.speakWord(`${pairName}. ${educationalHint || ''}`);
      }

      // Check Round or Game Victory
      if (newMatched.length >= tiles.length) {
        if (round < TOTAL_ROUNDS) {
          // Progress to Next Round
          audio.playMatch();
          setMascotMood('celebrating');
          setMascotTip(`🎉 Round ${round} Complete! Preparing Round ${round + 1}...`);

          setTimeout(() => {
            startRound(round + 1, false);
          }, 1200);
        } else {
          // Completed all 3 rounds!
          setIsVictory(true);
          setIsGameActive(false);
          audio.playFanfare();
          setMascotMood('celebrating');
          setMascotTip('🎉 Outstanding work! You completed all 3 Mahjong rounds!');

          const starTimes = level.starTimes || { threeStars: 90, twoStars: 150 };
          const earnedStars = timer <= starTimes.threeStars ? 3 : timer <= starTimes.twoStars ? 2 : 1;
          const timeBonus = timer < starTimes.threeStars ? Math.max(0, (starTimes.threeStars - timer) * 5) : 0;
          const totalFinalScore = score + 100 + timeBonus;
          const totalFinalXp = xp + 100;

          setVictoryStats({
            stars: earnedStars,
            timeBonus,
            finalScore: totalFinalScore,
            finalXp: totalFinalXp
          });

          // Dispatch LEVEL_COMPLETED event to Flutter
          flutterBridge.sendLevelCompleted(totalFinalScore);
        }
      }
    } else {
      // Mismatch - Penalize XP (-5, min 0), Pedagogical Scaffolding & Adaptive Failure Tracking
      audio.playMismatch();
      setMismatchedIds([firstTile.id, tile.id]);
      setMascotMood('thinking');
      setXp((prev) => Math.max(0, prev - 5));

      const w1 = firstTile.word || firstTile.partnerWord || 'item';
      const w2 = tile.word || tile.partnerWord || 'item';

      // Pedagogical Contextual Scaffolding Hint Generation:
      let feedbackTip = '';
      if (firstTile.relation && tile.relation && firstTile.relation === tile.relation) {
        // Both tiles share the same category (e.g. Opposites or Nature)
        feedbackTip = `🤔 "${w1}" and "${w2}" are both ${firstTile.relation}, but not a matching pair. Look for ${w1}'s partner! (-5 XP)`;
      } else if (firstTile.hint) {
        // Provide educational clue from the first tile's metadata
        feedbackTip = `💡 Clue for "${w1}": ${firstTile.hint} (-5 XP)`;
      } else if (firstTile.relation) {
        feedbackTip = `🤔 "${w1}" (${firstTile.relation}) and "${w2}" do not match. Try pairing "${w1}" with its ${firstTile.relation} partner! (-5 XP)`;
      } else {
        feedbackTip = `"${w1}" and "${w2}" are not a pair. Check the pictures and words carefully! (-5 XP)`;
      }

      setMascotTip(feedbackTip);

      // Extract raw question IDs for adaptive learning spaced repetition
      const rawFirstId = firstTile.pairId.replace(/^pair_\d+_/, '');
      const rawSecondId = tile.pairId.replace(/^pair_\d+_/, '');

      setFailedQuestionIds((prev) => {
        const next = new Set(prev);
        if (rawFirstId) next.add(rawFirstId);
        if (rawSecondId) next.add(rawSecondId);
        return next;
      });

      // Clear selection after feedback duration
      setTimeout(() => {
        setMismatchedIds([]);
        setSelectedTileId(null);
      }, 700);
    }
  };

  // Intelligent Hint
  const handleHint = () => {
    if (hintsRemaining <= 0) {
      setMascotTip("No hints left for this round, but you can do it!");
      return;
    }

    const bestMove = findSolvableHint(activeTiles);
    if (bestMove) {
      const [tileA, tileB] = bestMove;
      audio.playHint();
      setHintedPairIds([tileA.id, tileB.id]);
      setHintsRemaining((prev) => prev - 1);
      
      const educationalTip = tileA.hint || tileB.hint;
      if (educationalTip) {
        setMascotTip(`💡 "${tileA.word || tileA.partnerWord}" ↔ "${tileB.word || tileB.partnerWord}": ${educationalTip}`);
      } else {
        setMascotTip(`💡 Hint: "${tileA.word || tileA.partnerWord}" ↔ "${tileB.word || tileB.partnerWord}" (${tileA.relation}) are free to match!`);
      }
      audio.speakWord(`${tileA.word || tileA.partnerWord} and ${tileB.word || tileB.partnerWord}`);
    } else {
      setMascotTip("No direct moves left on the open sides. Click 'Smart Reorder' to continue!");
    }
  };

  // Undo Last Move
  const handleUndo = () => {
    if (moveHistory.length === 0) return;
    const lastMove = moveHistory[moveHistory.length - 1];
    setMatchedIds((prev) => prev.filter((id) => !lastMove.includes(id)));
    setMoveHistory((prev) => prev.slice(0, -1));
    setSelectedTileId(null);
    setHintedPairIds([]);
    setScore((prev) => Math.max(0, prev - 100));
    setXp((prev) => Math.max(0, prev - 100));
    setMascotTip("↩️ Move undone! Plan your removal order carefully!");
  };

  // Smart Re-Align
  const handleSmartReorder = () => {
    audio.playShuffle();
    const activePositions = activeTiles.map((t) => ({ x: t.x, y: t.y, z: t.z }));

    const activePairMap = new Map();
    activeTiles.forEach((t) => {
      if (!activePairMap.has(t.pairId)) {
        activePairMap.set(t.pairId, []);
      }
      activePairMap.get(t.pairId).push(t);
    });

    const activeVocab = [];
    activePairMap.forEach((tilesInPair) => {
      if (tilesInPair.length === 2) {
        activeVocab.push({
          id: tilesInPair[0].pairId,
          word1: tilesInPair[0].word,
          icon1: tilesInPair[0].icon,
          word2: tilesInPair[1].word,
          icon2: tilesInPair[1].icon,
          relation: tilesInPair[0].relation
        });
      }
    });

    if (activeVocab.length > 0) {
      const regeneratedActiveTiles = generateSolutionFirstPuzzle(
        activePositions,
        activeVocab
      );

      const newTiles = tiles.map((t) => {
        if (matchedIds.includes(t.id)) return t;
        const matchingRegen = regeneratedActiveTiles.shift();
        return matchingRegen || t;
      });

      setTiles(newTiles);
    }

    setSelectedTileId(null);
    setHintedPairIds([]);
    setMascotTip("✨ Solvable rearrangement complete! New free pairs are now open!");
  };

  // Dynamic Tile Sizing based on the longest word in the active round
  const maxWordLength = useMemo(() => {
    let maxLen = 0;
    tiles.forEach((t) => {
      if (t.word && t.word.length > maxLen) {
        maxLen = t.word.length;
      }
    });
    return Math.max(maxLen, 6); // default baseline 6 chars
  }, [tiles]);

  // Wide landscape tile geometry with increased width and dynamic expansion for long words
  const tileGeometry = useMemo(() => {
    const configSize = GAME_CONFIG.TILE_SIZE || {};
    const baseW = configSize.BASE_WIDTH || 280;
    const baseH = configSize.BASE_HEIGHT || 220;
    const maxW = configSize.MAX_WIDTH || 400;
    const unitXRatio = configSize.UNIT_X_RATIO || 0.48;
    const unitYVal = configSize.UNIT_Y || 120;

    const extraWidth = Math.max(0, maxWordLength - 6) * 16;
    const tileWidth = Math.min(maxW, baseW + extraWidth);
    const tileHeight = baseH;
    const unitX = Math.round(tileWidth * unitXRatio);
    const unitY = unitYVal;
    return { tileWidth, tileHeight, unitX, unitY };
  }, [maxWordLength]);

  // Board layout bounds based on configured pair count
  const sessionLayout = getLayoutForPairs(PAIRS_PER_ROUND);
  const minX = Math.min(...sessionLayout.map((s) => s.x));
  const maxX = Math.max(...sessionLayout.map((s) => s.x));
  const minY = Math.min(...sessionLayout.map((s) => s.y));
  const maxY = Math.max(...sessionLayout.map((s) => s.y));
  const maxZ = Math.max(...sessionLayout.map((s) => s.z));

  const boardWidth = (maxX - minX) * tileGeometry.unitX + tileGeometry.tileWidth + maxZ * 8;
  const boardHeight = (maxY - minY) * tileGeometry.unitY + tileGeometry.tileHeight + maxZ * 16;

  const isDeadEnd = activeTiles.length > 0 && availableFreePairs.length === 0 && !isVictory;

  return (
    <AspectRatioContainer>
      {/* Cartoon Himalayan Background */}
      <HimalayanBackground themeGradient={level.bgGradient} />

      {/* Main Menu Scene */}
      {scene === 'MENU' && (
        <>
          {/* Top Left Toolbar: 1 Button (Settings) */}
          <GlobalTopBar
            buttons={[
              {
                id: 'settings',
                icon: '⚙️',
                title: 'Settings',
                onClick: () => setShowSettings(true)
              }
            ]}
          />

          <MainMenu
            headerBadge={level.headerBadge}
            title={level.title}
            subtitle={level.subtitle}
            onPlay={handleStartGame}
          />
        </>
      )}

      {/* How To Play Tutorial Modal */}
      {showHowToPlay && (
        <HowToPlayModal onClose={() => setShowHowToPlay(false)} />
      )}

      {/* Settings Modal with [Clickable Circular Icon] + Sliders */}
      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          sfxVolume={sfxVolume}
          setSfxVolume={setSfxVolume}
          sfxMuted={sfxMuted}
          setSfxMuted={setSfxMuted}
          musicVolume={musicVolume}
          setMusicVolume={setMusicVolume}
          musicMuted={musicMuted}
          setMusicMuted={setMusicMuted}
        />
      )}

      {/* Active Game Scene */}
      {scene === 'GAME' && (
        <>
          {/* Top Left Toolbar: Standard 2-Button Mapping (Slot 0: Pause, Slot 1: Settings) */}
          <GlobalTopBar
            buttons={[
              {
                id: 'pause',
                icon: '⏸️',
                title: 'Pause Game',
                onClick: () => setShowPause(true)
              },
              {
                id: 'settings',
                icon: '⚙️',
                title: 'Settings',
                onClick: () => setShowSettings(true)
              }
            ]}
          />

          {/* Pause Modal */}
          {showPause && (
            <PauseModal
              onResume={() => setShowPause(false)}
              onRestart={() => {
                setShowPause(false);
                startRound(1, true);
              }}
              onQuit={() => {
                setShowPause(false);
                setScene('MENU');
              }}
            />
          )}

          {/* Top Header Bar */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '120px',
              padding: '16px 44px',
              display: 'flex',
              alignItems: 'center',
              zIndex: 80,
              background: 'linear-gradient(180deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.45) 75%, rgba(0,0,0,0) 100%)',
              boxSizing: 'border-box'
            }}
          >
            {/* Left: Round & Open Pairs (positioned next to the pause/settings toolbar buttons) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', zIndex: 82, marginLeft: '215px' }}>
              <div
                style={{
                  width: '135px',
                  boxSizing: 'border-box',
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  padding: '8px 12px',
                  borderRadius: '20px',
                  textAlign: 'center',
                  boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)',
                  border: '3px solid #7dd3fc'
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: '900', color: '#e0f2fe', letterSpacing: '0.8px', whiteSpace: 'nowrap' }}>
                  ROUND
                </div>
                <div style={{ fontSize: '26px', fontWeight: '900', color: '#ffffff', fontVariantNumeric: 'tabular-nums' }}>
                  {round} / {TOTAL_ROUNDS}
                </div>
              </div>

              <div
                style={{
                  width: '140px',
                  boxSizing: 'border-box',
                  background: availableFreePairs.length > 0 ? '#ecfdf5' : '#fef2f2',
                  border: `3px solid ${availableFreePairs.length > 0 ? '#10b981' : '#ef4444'}`,
                  padding: '8px 12px',
                  borderRadius: '20px',
                  textAlign: 'center',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.2)'
                }}
                title="Playable open pairs right now"
              >
                <div style={{ fontSize: '13px', fontWeight: '900', color: availableFreePairs.length > 0 ? '#047857' : '#b91c1c', letterSpacing: '0.8px', whiteSpace: 'nowrap' }}>
                  OPEN PAIRS
                </div>
                <div style={{ fontSize: '26px', fontWeight: '900', color: availableFreePairs.length > 0 ? '#059669' : '#dc2626', fontVariantNumeric: 'tabular-nums' }}>
                  {availableFreePairs.length}
                </div>
              </div>
            </div>

            {/* Center: Objective / Round Progress Banner */}
            <div
              style={{
                position: 'absolute',
                top: '22px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(255, 255, 255, 0.98)',
                padding: '14px 38px',
                borderRadius: '50px',
                border: '4px solid #facc15',
                boxShadow: '0 10px 28px rgba(0,0,0,0.35)',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                maxWidth: '750px',
                zIndex: 82
              }}
            >
              <span style={{ fontSize: '32px' }}>🎯</span>
              <span style={{ fontSize: '24px', fontWeight: '900', color: '#1e293b', lineHeight: '1.25' }}>
                Round {round} of {TOTAL_ROUNDS} • Match {PAIRS_PER_ROUND} Pairs!
              </span>
            </div>

            {/* Right: Essential HUD (XP Bar, Score, Time) */}
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '14px', zIndex: 82 }}>
              {/* XP System Widget */}
              <div
                style={{
                  minWidth: '180px',
                  boxSizing: 'border-box',
                  background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                  padding: '8px 14px',
                  borderRadius: '20px',
                  boxShadow: '0 4px 14px rgba(124, 58, 237, 0.35)',
                  border: '3px solid #c4b5fd',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '3px'
                }}
                title={`Experience Points: ${xp} XP (Level ${Math.floor(xp / 300) + 1})`}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '12px', fontWeight: '900', color: '#ede9fe', letterSpacing: '0.8px' }}>
                    ⚡ LV {Math.floor(xp / 300) + 1}
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '900', color: '#fef08a', fontVariantNumeric: 'tabular-nums' }}>
                    {xp} XP
                  </div>
                </div>
                {/* XP Level Progress Bar */}
                <div
                  style={{
                    width: '100%',
                    height: '10px',
                    background: 'rgba(0, 0, 0, 0.25)',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}
                >
                  <div
                    style={{
                      width: `${Math.min(100, ((xp % 300) / 300) * 100)}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #facc15 0%, #fbbf24 100%)',
                      borderRadius: '8px',
                      transition: 'width 0.35s ease'
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  width: '130px',
                  boxSizing: 'border-box',
                  background: 'rgba(255, 255, 255, 0.96)',
                  padding: '8px 12px',
                  borderRadius: '20px',
                  textAlign: 'center',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
                  border: '3px solid rgba(255, 255, 255, 0.9)'
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: '900', color: '#64748b', letterSpacing: '0.8px', whiteSpace: 'nowrap' }}>
                  SCORE
                </div>
                <div style={{ fontSize: '26px', fontWeight: '900', color: '#0284c7', fontVariantNumeric: 'tabular-nums' }}>
                  {score}
                </div>
              </div>

              <div
                style={{
                  width: '130px',
                  boxSizing: 'border-box',
                  background: 'rgba(255, 255, 255, 0.96)',
                  padding: '8px 12px',
                  borderRadius: '20px',
                  textAlign: 'center',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
                  border: '3px solid rgba(255, 255, 255, 0.9)'
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: '900', color: '#64748b', letterSpacing: '0.8px', whiteSpace: 'nowrap' }}>
                  TIME
                </div>
                <div style={{ fontSize: '26px', fontWeight: '900', color: '#059669', fontVariantNumeric: 'tabular-nums' }}>
                  {formatTime(timer)}
                </div>
              </div>
            </div>
          </div>

          {/* Round Transition Flash Announcement Banner (Perfect Center Overlay) */}
          {roundTransitionBanner && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(15, 23, 42, 0.45)',
                backdropFilter: 'blur(4px)',
                zIndex: 95,
                pointerEvents: 'none'
              }}
            >
              <div
                style={{
                  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                  color: '#ffffff',
                  padding: '24px 64px',
                  borderRadius: '50px',
                  fontSize: '44px',
                  fontWeight: '900',
                  border: '6px solid #bbf7d0',
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 50px rgba(34, 197, 94, 0.6)',
                  letterSpacing: '1px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  animation: 'popIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}
              >
                <span>✨</span>
                <span>{roundTransitionBanner}</span>
                <span>✨</span>
              </div>
            </div>
          )}

          {/* Main Playing Board - 6 Tiles Solvable Unit */}
          <div
            style={{
              position: 'absolute',
              top: '140px',
              bottom: '70px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '1800px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 10
            }}
          >
            <div
              style={{
                position: 'relative',
                width: `${boardWidth}px`,
                height: `${boardHeight}px`,
                transition: 'all 0.3s ease'
              }}
            >
              {tiles.map((tile) => (
                <Tile
                  key={tile.id}
                  tile={{ ...tile, minX, minY }}
                  geometry={tileGeometry}
                  isFree={freeTileIds.has(tile.id)}
                  isSelected={selectedTileId === tile.id}
                  isHinted={hintedPairIds.includes(tile.id)}
                  isMismatch={mismatchedIds.includes(tile.id)}
                  isMatched={matchedIds.includes(tile.id)}
                  isJustUnlocked={justUnlockedIds.includes(tile.id)}
                  onClick={handleTileClick}
                />
              ))}
            </div>
          </div>

          {/* Gentle Recovery Modal if blocked */}
          {isDeadEnd && (
            <div
              style={{
                position: 'absolute',
                top: '130px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'linear-gradient(135deg, #ffffff 0%, #fef3c7 100%)',
                border: '5px solid #f59e0b',
                borderRadius: '28px',
                padding: '22px 44px',
                boxShadow: '0 18px 50px rgba(0,0,0,0.45)',
                display: 'flex',
                alignItems: 'center',
                gap: '28px',
                zIndex: 90,
                animation: 'popIn 0.3s ease'
              }}
            >
              <div>
                <div style={{ fontSize: '24px', fontWeight: '900', color: '#b45309' }}>
                  ⚠️ No Open Moves Remaining!
                </div>
                <div style={{ fontSize: '20px', color: '#78350f', fontWeight: '700', marginTop: '3px' }}>
                  Would you like to undo your last move or re-align the remaining tiles?
                </div>
              </div>

              <div style={{ display: 'flex', gap: '18px' }}>
                <button
                  onClick={handleUndo}
                  disabled={moveHistory.length === 0}
                  style={{
                    background: moveHistory.length > 0 ? '#3b82f6' : '#94a3b8',
                    color: '#ffffff',
                    padding: '16px 34px',
                    borderRadius: '20px',
                    fontWeight: '900',
                    fontSize: '26px',
                    letterSpacing: '0.6px',
                    boxShadow: '0 4px 16px rgba(59, 130, 246, 0.4)',
                    cursor: moveHistory.length > 0 ? 'pointer' : 'not-allowed'
                  }}
                >
                  UNDO MOVE
                </button>
                <button
                  onClick={handleSmartReorder}
                  style={{
                    background: '#10b981',
                    color: '#ffffff',
                    padding: '16px 34px',
                    borderRadius: '20px',
                    fontWeight: '900',
                    fontSize: '26px',
                    letterSpacing: '0.6px',
                    boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4)',
                    cursor: 'pointer'
                  }}
                >
                  SMART RE-ORDER
                </button>
              </div>
            </div>
          )}

          {/* Action Toolbar */}
          <div
            style={{
              position: 'absolute',
              top: '140px',
              right: '28px',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
              zIndex: 85
            }}
          >
            <button
              onClick={handleHint}
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: '#ffffff',
                padding: '20px 42px',
                borderRadius: '28px',
                border: '5px solid #fde68a',
                boxShadow: '0 10px 28px rgba(217, 119, 6, 0.48)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: '32px',
                fontWeight: '900',
                letterSpacing: '0.8px',
                cursor: 'pointer',
                textAlign: 'center'
              }}
            >
              <span>HINT ({hintsRemaining})</span>
            </button>

            <button
              onClick={handleUndo}
              disabled={moveHistory.length === 0}
              style={{
                background: moveHistory.length > 0 ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' : '#94a3b8',
                color: '#ffffff',
                padding: '20px 42px',
                borderRadius: '28px',
                border: `5px solid ${moveHistory.length > 0 ? '#93c5fd' : '#cbd5e1'}`,
                boxShadow: '0 10px 28px rgba(59, 130, 246, 0.4)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: '32px',
                fontWeight: '900',
                letterSpacing: '0.8px',
                cursor: moveHistory.length > 0 ? 'pointer' : 'not-allowed',
                textAlign: 'center'
              }}
            >
              <span>UNDO</span>
            </button>
          </div>

          {/* Mascot Pema */}
          <Mascot
            tip={mascotTip}
            mood={mascotMood}
            onClick={() => {
              if (mascotTip) {
                audio.speakWord(mascotTip);
              }
            }}
          />

          {/* Bottom Progress Bar */}
          <div
            style={{
              position: 'absolute',
              bottom: '18px',
              right: '28px',
              width: '390px',
              background: 'rgba(255, 255, 255, 0.97)',
              borderRadius: '24px',
              padding: '16px 26px',
              boxShadow: '0 8px 28px rgba(0, 0, 0, 0.28)',
              zIndex: 20
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '20px',
                fontWeight: '900',
                color: '#1e293b',
                marginBottom: '8px'
              }}
            >
              <span>Round {round} Progress:</span>
              <span style={{ color: '#0284c7' }}>
                {matchedIds.length / 2} / {tiles.length / 2} Pairs
              </span>
            </div>
            <div
              style={{
                width: '100%',
                height: '18px',
                background: '#e2e8f0',
                borderRadius: '12px',
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  width: `${(matchedIds.length / (tiles.length || 1)) * 100}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #3b82f6, #10b981)',
                  borderRadius: '12px',
                  transition: 'width 0.4s ease'
                }}
              />
            </div>
          </div>

          {/* Victory Modal after Round 3 */}
          {isVictory && (
            <VictoryModal
              score={victoryStats.finalScore}
              xp={victoryStats.finalXp || xp}
              timeBonus={victoryStats.timeBonus}
              timeTaken={timer}
              levelTitle="Himalayan Word Mahjong"
              stars={victoryStats.stars}
              onReplay={() => startRound(1, true)}
              onHome={() => setScene('MENU')}
            />
          )}
        </>
      )}

      {/* Flutter Bridge Developer Debug Inspector */}
      {showBridgeDebug && (
        <BridgeDebugOverlay onClose={() => setShowBridgeDebug(false)} />
      )}
    </AspectRatioContainer>
  );
}
