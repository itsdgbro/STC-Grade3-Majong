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
import { GameOverModal } from './components/GameOverModal';
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
  const [questionStats, setQuestionStats] = useState({});
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
  const [hearts, setHearts] = useState(5);
  const [isGameOver, setIsGameOver] = useState(false);
  const [heartLostAnim, setHeartLostAnim] = useState(false);

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
   * Selects adaptive question pairs for the round with strict uniqueness:
   * 1. Mistaken / multiple-tried questions are prioritized to be asked again.
   * 2. Fresh unseen questions from the pool are selected next.
   * 3. Easy words (solved on first try with 0 errors) are asked least / not repeated.
   * 4. Enforces STRICT uniqueness: no duplicate words or icons anywhere in the round.
   */
  const selectQuestionsForRound = useCallback((currentStats, currentFailed, currentUsed, pool) => {
    const chosenQuestions = [];
    const usedWordsInRound = new Set();
    const usedIconsInRound = new Set();
    const newUsed = new Set(currentUsed);

    const getStats = (id) => currentStats[id] || { id, errorCount: 0, roundsEncountered: 0, easy: false, mastered: false };

    // Strict uniqueness check: verify candidate question does not share any word or icon with chosen pairs in this round
    const canAdd = (q) => {
      if (!q || !q.id) return false;
      if (chosenQuestions.some((cq) => cq.id === q.id)) return false;

      const w1 = (q.word1 || '').trim().toLowerCase();
      const w2 = (q.word2 || '').trim().toLowerCase();
      if (!w1 && !w2) return false;

      const i1 = (q.icon1 || '').trim();
      const i2 = (q.icon2 || '').trim();
      const hasDistinctIcons = Boolean(i1 || i2);

      // If word1 and word2 are identical text with no distinct icons, reject to prevent duplicate tiles
      if (w1 && w2 && w1 === w2 && !hasDistinctIcons) return false;

      // Reject if either word already appears in this round
      if (w1 && usedWordsInRound.has(w1)) return false;
      if (w2 && usedWordsInRound.has(w2)) return false;

      // Reject if either icon already appears in this round
      if (i1 && usedIconsInRound.has(i1)) return false;
      if (i2 && usedIconsInRound.has(i2)) return false;

      return true;
    };

    const addQuestion = (q) => {
      chosenQuestions.push(q);
      newUsed.add(q.id);

      const w1 = (q.word1 || '').trim().toLowerCase();
      const w2 = (q.word2 || '').trim().toLowerCase();
      const i1 = (q.icon1 || '').trim();
      const i2 = (q.icon2 || '').trim();

      if (w1) usedWordsInRound.add(w1);
      if (w2) usedWordsInRound.add(w2);
      if (i1) usedIconsInRound.add(i1);
      if (i2) usedIconsInRound.add(i2);
    };

    // Priority 1: Mistaken / Multiple-tried questions that need retry (sorted by highest errorCount first)
    const mistakenQuestions = pool
      .filter((q) => {
        const stats = getStats(q.id);
        return currentFailed.has(q.id) || (stats.needsReview && (stats.errorCount || 0) > 0);
      })
      .sort((a, b) => (getStats(b.id).errorCount || 0) - (getStats(a.id).errorCount || 0));

    for (const q of mistakenQuestions) {
      if (chosenQuestions.length >= PAIRS_PER_ROUND) break;
      if (canAdd(q)) {
        addQuestion(q);
      }
    }

    // Priority 2: Fresh unseen questions from pool that haven't been asked yet
    const unseenQuestions = pool.filter(
      (q) => !newUsed.has(q.id) && !chosenQuestions.some((cq) => cq.id === q.id)
    );
    const shuffledUnseen = [...unseenQuestions].sort(() => Math.random() - 0.5);

    for (const q of shuffledUnseen) {
      if (chosenQuestions.length >= PAIRS_PER_ROUND) break;
      if (canAdd(q)) {
        addQuestion(q);
      }
    }

    // Priority 3: Fallback (if unseen exhausted, pick questions not marked as easy)
    if (chosenQuestions.length < PAIRS_PER_ROUND) {
      const nonEasyPool = pool.filter(
        (q) => !getStats(q.id).easy && !chosenQuestions.some((cq) => cq.id === q.id)
      );
      const shuffledNonEasy = [...nonEasyPool].sort(() => Math.random() - 0.5);
      for (const q of shuffledNonEasy) {
        if (chosenQuestions.length >= PAIRS_PER_ROUND) break;
        if (canAdd(q)) {
          addQuestion(q);
        }
      }
    }

    // Priority 4: Ultimate pool fallback (only if pool completely exhausted)
    if (chosenQuestions.length < PAIRS_PER_ROUND) {
      const remainingPool = pool.filter(
        (q) => !chosenQuestions.some((cq) => cq.id === q.id)
      );
      const shuffledRemaining = [...remainingPool].sort(() => Math.random() - 0.5);
      for (const q of shuffledRemaining) {
        if (chosenQuestions.length >= PAIRS_PER_ROUND) break;
        if (canAdd(q)) {
          addQuestion(q);
        }
      }
    }

    return {
      selectedQuestions: chosenQuestions,
      updatedUsed: newUsed
    };
  }, []);

  /**
   * Start a round (session)
   */
  const startRound = useCallback((targetRound, isNewGame = false) => {
    const activeLevel = levels[0] || DEFAULT_LEVELS[0];
    const fullPool = activeLevel.questions || activeLevel.vocabularyPool || [];

    let currentStats = questionStats;
    let currentFailed = failedQuestionIds;
    let currentUsed = usedQuestionIds;

    if (isNewGame) {
      currentStats = {};
      currentFailed = new Set();
      currentUsed = new Set();
      setQuestionStats({});
      setFailedQuestionIds(new Set());
      setRetriedQuestionIds(new Set());
      setMasteredQuestionIds(new Set());
      setUsedQuestionIds(new Set());
      setScore(0);
      setXp(0);
      setTimer(0);
      setHearts(5);
      setIsGameOver(false);
    }

    // Select adaptive questions with strict uniqueness
    const { selectedQuestions, updatedUsed } = selectQuestionsForRound(
      currentStats,
      currentFailed,
      currentUsed,
      fullPool
    );

    setUsedQuestionIds(updatedUsed);

    // Track roundsEncountered in questionStats and reset errorsThisRound
    setQuestionStats((prev) => {
      const next = { ...prev };
      selectedQuestions.forEach((q) => {
        const cur = next[q.id] || { id: q.id, errorCount: 0, roundsEncountered: 0, easy: false, mastered: false, needsReview: false, errorsThisRound: 0 };
        next[q.id] = {
          ...cur,
          roundsEncountered: cur.roundsEncountered + 1,
          errorsThisRound: 0
        };
      });
      return next;
    });

    // Dynamically retrieve the layout template configured for this number of pairs
    const currentLayout = getLayoutForPairs(PAIRS_PER_ROUND);

    // Generate guaranteed-solvable layout with exactly PAIRS_PER_ROUND unique pairs
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
    setHearts(5);
    setIsGameOver(false);
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


  // Timer interval
  useEffect(() => {
    let interval = null;

    if (isGameActive && !isVictory && !isGameOver && !showPause && scene === 'GAME') {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isGameActive, isVictory, isGameOver, showPause, scene]);

  // Handle Tile Selection & Learning Error Tracking
  const handleTileClick = (tile) => {
    if (isGameOver || !isGameActive) return;

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
      if (tile.hint) {
        setMascotTip(`💡 "${tile.word || tile.partnerWord}": ${tile.hint}`);
      } else if (tile.word) {
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
      setScore((prev) => prev + (GAME_CONFIG.SCORE_PER_MATCH || 3));
      setXp((prev) => prev + (GAME_CONFIG.SCORE_PER_MATCH || 3));
      setMascotMood('correct');

      // Extract raw question ID (e.g. from pair_0_e1 -> e1)
      const rawQuestionId = tile.pairId.replace(/^pair_\d+_/, '');

      // Check if this was a previously failed/retried question that is now mastered!
      const prevQuestionStats = questionStats[rawQuestionId] || { id: rawQuestionId, errorCount: 0, roundsEncountered: 1, easy: false, mastered: false, needsReview: false, errorsThisRound: 0 };
      const wasRetry = failedQuestionIds.has(rawQuestionId) || prevQuestionStats.needsReview;

      if (wasRetry) {
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

      // Update adaptive question statistics
      setQuestionStats((prev) => {
        const next = { ...prev };
        const cur = next[rawQuestionId] || { id: rawQuestionId, errorCount: 0, roundsEncountered: 1, easy: false, mastered: false, needsReview: false, errorsThisRound: 0 };
        const errorsInThisRound = cur.errorsThisRound || 0;

        if (cur.errorCount === 0) {
          // Solved on first attempt with 0 errors: mark easy & mastered
          next[rawQuestionId] = {
            ...cur,
            easy: true,
            mastered: true,
            needsReview: false
          };
        } else if (errorsInThisRound === 0) {
          // Previously had errors, but solved cleanly on retry round: mastered & remediated
          next[rawQuestionId] = {
            ...cur,
            easy: false,
            mastered: true,
            needsReview: false
          };
        } else {
          // Still had errors in this round: keep needsReview true for reinforcement
          next[rawQuestionId] = {
            ...cur,
            easy: false,
            mastered: false,
            needsReview: true
          };
        }
        return next;
      });

      // Calculate newly uncovered tiles
      const nextActiveTiles = tiles.filter((t) => !newMatched.includes(t.id));
      const nextFreeTiles = getFreeTiles(nextActiveTiles);
      const newlyFreed = nextFreeTiles
        .filter((t) => !previousFree.has(t.id))
        .map((t) => t.id);

      const pairName = (firstTile.word || firstTile.partnerWord || tile.word || tile.partnerWord);
      const educationalHint = firstTile.hint || tile.hint;

      const pts = GAME_CONFIG.SCORE_PER_MATCH || 3;

      if (wasRetry) {
        setMascotMood('celebrating');
        if (educationalHint) {
          setMascotTip(`🌟 Mastered "${pairName}"! (+${pts} pts) 💡 ${educationalHint}`);
        } else {
          setMascotTip(`🌟 Amazing mastery! You solved "${pairName}" correctly! (+${pts} pts)`);
        }
        audio.speakWord(`Great job! You mastered ${pairName}! ${educationalHint || ''}`);
      } else if (newlyFreed.length > 0) {
        setJustUnlockedIds(newlyFreed);
        setTimeout(() => setJustUnlockedIds([]), 900);
        if (educationalHint) {
          setMascotTip(`✨ "${pairName}" matched! (+${pts} pts) 💡 ${educationalHint}`);
        } else {
          setMascotTip(`Brilliant! "${pairName}" matched! (+${pts} pts) ✨`);
        }
        audio.speakWord(`${pairName}. ${educationalHint || ''}`);
      } else {
        if (educationalHint) {
          setMascotTip(`✨ "${pairName}" matched! (+${pts} pts) 💡 ${educationalHint}`);
        } else {
          setMascotTip(`Superb! "${pairName}" is a correct match! (+${pts} pts) ✨`);
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
          const totalFinalScore = score + pts + timeBonus;
          const totalFinalXp = xp + pts;

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
      // Mismatch - Deduct 1 Heart & Check Game Over
      audio.playMismatch();
      audio.playHeartLost();
      setHeartLostAnim(true);
      setTimeout(() => setHeartLostAnim(false), 600);

      setMismatchedIds([firstTile.id, tile.id]);
      setMascotMood('thinking');
      setXp((prev) => Math.max(0, prev - 5));

      const nextHearts = Math.max(0, hearts - 1);
      setHearts(nextHearts);

      const w1 = firstTile.word || firstTile.partnerWord || 'item';
      const w2 = tile.word || tile.partnerWord || 'item';

      // Pedagogical Contextual Scaffolding Hint Generation:
      let feedbackTip = '';
      if (nextHearts === 0) {
        feedbackTip = `💔 Out of hearts! Don't worry, practice makes perfect!`;
      } else if (firstTile.relation && tile.relation && firstTile.relation === tile.relation) {
        // Both tiles share the same category (e.g. Opposites or Nature)
        feedbackTip = `🤔 "${w1}" and "${w2}" are both ${firstTile.relation}, but not a matching pair. Look for ${w1}'s partner! (-1 ❤️)`;
      } else if (firstTile.hint) {
        // Provide educational clue from the first tile's metadata
        feedbackTip = `💡 Clue for "${w1}": ${firstTile.hint} (-1 ❤️)`;
      } else if (firstTile.relation) {
        feedbackTip = `🤔 "${w1}" (${firstTile.relation}) and "${w2}" do not match. Try pairing "${w1}" with its ${firstTile.relation} partner! (-1 ❤️)`;
      } else {
        feedbackTip = `"${w1}" and "${w2}" are not a pair. Check the pictures and words carefully! (-1 ❤️)`;
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

      // Update adaptive statistics: mark as mistaken / multiple tried
      setQuestionStats((prev) => {
        const next = { ...prev };
        [rawFirstId, rawSecondId].forEach((qid) => {
          if (qid) {
            const cur = next[qid] || { id: qid, errorCount: 0, roundsEncountered: 1, easy: false, mastered: false, needsReview: false, errorsThisRound: 0 };
            next[qid] = {
              ...cur,
              errorCount: cur.errorCount + 1,
              errorsThisRound: (cur.errorsThisRound || 0) + 1,
              easy: false,
              mastered: false,
              needsReview: true
            };
          }
        });
        return next;
      });

      // Clear selection after feedback duration
      setTimeout(() => {
        setMismatchedIds([]);
        setSelectedTileId(null);
      }, 700);

      // If all hearts lost, trigger Game Over modal
      if (nextHearts === 0) {
        setTimeout(() => {
          setIsGameOver(true);
          setIsGameActive(false);
          audio.playGameOver();
          flutterBridge.sendGameOver(score);
        }, 750);
      }
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
    const pts = GAME_CONFIG.SCORE_PER_MATCH || 3;
    setScore((prev) => Math.max(0, prev - pts));
    setXp((prev) => Math.max(0, prev - pts));
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

      {/* In-Game Subtle Background Blur & Vignette Focus Layer */}
      {scene === 'GAME' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backdropFilter: 'blur(3.5px)',
            WebkitBackdropFilter: 'blur(3.5px)',
            background: 'radial-gradient(ellipse at center, rgba(15, 23, 42, 0.08) 0%, rgba(15, 23, 42, 0.32) 100%)',
            zIndex: 2,
            pointerEvents: 'none',
            transition: 'all 0.5s ease'
          }}
        />
      )}

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


            {/* Center: Objective / Round Progress Banner */}
            <div
              style={{
                position: 'absolute',
                top: '18px',
                left: '50%',
                transform: 'translateX(-50%)',
                height: '84px',
                boxSizing: 'border-box',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                padding: '10px 48px',
                borderRadius: '50px',
                border: '4px solid #facc15',
                boxShadow: '0 10px 28px rgba(0,0,0,0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                maxWidth: '960px',
                whiteSpace: 'nowrap',
                zIndex: 82
              }}
            >
              <span style={{ fontSize: '38px', fontWeight: '900', color: '#1e293b', lineHeight: '1.2', letterSpacing: '0.4px' }}>
                Round {round} of {TOTAL_ROUNDS} • Match {PAIRS_PER_ROUND} Pairs!
              </span>
            </div>

            {/* Right: Essential HUD (Score & 5 Hearts - Replaces XP & Timer) */}
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '16px', zIndex: 82 }}>
              {/* Score Widget */}
              <div
                style={{
                  minWidth: '260px',
                  height: '74px',
                  boxSizing: 'border-box',
                  background: 'rgba(255, 255, 255, 0.94)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  padding: '8px 28px',
                  borderRadius: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '16px',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
                  border: '3px solid rgba(255, 255, 255, 0.9)',
                  whiteSpace: 'nowrap'
                }}
              >
                <span style={{ fontSize: '34px', fontWeight: '900', color: '#475569', letterSpacing: '0.5px' }}>
                  Score
                </span>
                <span style={{ fontSize: '42px', fontWeight: '900', color: '#0284c7', fontVariantNumeric: 'tabular-nums' }}>
                  {score}
                </span>
              </div>

              {/* 5 Hearts Widget (Replaces Timer & XP) */}
              <div
                style={{
                  height: '74px',
                  boxSizing: 'border-box',
                  background: 'rgba(255, 255, 255, 0.94)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  padding: '8px 22px',
                  borderRadius: '24px',
                  boxShadow: heartLostAnim ? '0 4px 18px rgba(239, 68, 68, 0.45)' : '0 4px 14px rgba(0,0,0,0.2)',
                  border: heartLostAnim ? '3px solid #ef4444' : '3px solid rgba(255, 255, 255, 0.9)',
                  transform: heartLostAnim ? 'scale(1.06)' : 'scale(1)',
                  transition: 'all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                title={`${hearts} of 5 hearts remaining`}
              >
                {[1, 2, 3, 4, 5].map((hIndex) => {
                  const isFilled = hIndex <= hearts;
                  return (
                    <span
                      key={hIndex}
                      style={{
                        fontSize: '32px',
                        lineHeight: '1',
                        display: 'inline-block',
                        transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        transform: isFilled ? 'scale(1)' : 'scale(0.85)',
                        filter: isFilled
                          ? 'drop-shadow(0 2px 4px rgba(239, 68, 68, 0.45))'
                          : 'grayscale(100%) opacity(0.22)'
                      }}
                    >
                      ❤️
                    </span>
                  );
                })}
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
              {/* Subtle ambient depth aura under the tiles bringing them into sharp focus */}
              <div
                style={{
                  position: 'absolute',
                  inset: '-36px -48px',
                  borderRadius: '44px',
                  background: 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.05) 65%, transparent 100%)',
                  backdropFilter: 'blur(5px)',
                  WebkitBackdropFilter: 'blur(5px)',
                  boxShadow: '0 24px 60px rgba(0, 0, 0, 0.2)',
                  pointerEvents: 'none',
                  zIndex: 0
                }}
              />

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
              bottom: '20px',
              right: '28px',
              width: '490px',
              background: 'rgba(255, 255, 255, 0.94)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              borderRadius: '28px',
              padding: '20px 32px',
              boxShadow: '0 10px 32px rgba(0, 0, 0, 0.28)',
              border: '3px solid rgba(255, 255, 255, 0.95)',
              zIndex: 20
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '26px',
                fontWeight: '900',
                color: '#1e293b',
                marginBottom: '12px',
                letterSpacing: '0.3px'
              }}
            >
              <span>Round {round} Progress:</span>
              <span style={{ color: '#0284c7', fontVariantNumeric: 'tabular-nums' }}>
                {matchedIds.length / 2} / {tiles.length / 2} Pairs
              </span>
            </div>
            <div
              style={{
                width: '100%',
                height: '24px',
                background: '#e2e8f0',
                borderRadius: '14px',
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  width: `${(matchedIds.length / (tiles.length || 1)) * 100}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #3b82f6, #10b981)',
                  borderRadius: '14px',
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

          {/* Game Over Modal when all hearts are lost */}
          {isGameOver && (
            <GameOverModal
              score={score}
              round={round}
              totalRounds={TOTAL_ROUNDS}
              pairsMatched={matchedIds.length / 2}
              totalPairs={tiles.length / 2}
              onRetry={() => {
                setIsGameOver(false);
                setHearts(5);
                startRound(round, false);
              }}
              onHome={() => {
                setIsGameOver(false);
                setScene('MENU');
              }}
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
