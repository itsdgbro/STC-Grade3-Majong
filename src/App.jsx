import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AspectRatioContainer } from './components/AspectRatioContainer';
import { HimalayanBackground } from './components/HimalayanBackground';
import { MainMenu } from './components/MainMenu';
import { HowToPlayModal } from './components/HowToPlayModal';
import { SettingsModal } from './components/SettingsModal';
import { PauseModal } from './components/PauseModal';
import { CrosswordGrid } from './components/CrosswordGrid';
import { LetterKeyboard } from './components/LetterKeyboard';
import { ClueCard } from './components/ClueCard';
import { VictoryModal } from './components/VictoryModal';
import { RoundCompleteModal } from './components/RoundCompleteModal';
import { GameOverModal } from './components/GameOverModal';
import { GAME_CONFIG } from './data/gameConfig';
import { generateCrosswordPuzzle } from './utils/crosswordGenerator';
import { audio } from './utils/audio';
import { flutterBridge } from './utils/flutterBridge';
import { BridgeDebugOverlay } from './components/BridgeDebugOverlay';

const TOTAL_ROUNDS = GAME_CONFIG.TOTAL_ROUNDS || 5;

export default function App() {
  // Navigation Scene State: 'MENU' | 'GAME'
  const [scene, setScene] = useState('MENU');
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPause, setShowPause] = useState(false);
  const [showRoundComplete, setShowRoundComplete] = useState(false);
  const [roundCompleteData, setRoundCompleteData] = useState({ round: 1, wordsCount: 4, words: [] });
  const [showGameOver, setShowGameOver] = useState(false);

  // All word definitions from JSON
  const [wordsPool, setWordsPool] = useState([]);

  // Game progression
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [hintsRemaining, setHintsRemaining] = useState(GAME_CONFIG.HINTS_PER_ROUND || 3);
  const [hearts, setHearts] = useState(GAME_CONFIG.MAX_HEARTS || 5);
  const [heartShake, setHeartShake] = useState(false);
  const heartsRef = useRef(GAME_CONFIG.MAX_HEARTS || 5);
  const [isGameActive, setIsGameActive] = useState(false);

  // Completion tracking system
  const [totalSpawnWordCount, setTotalSpawnWordCount] = useState(0);
  const [flagCounter, setFlagCounter] = useState(0);
  const totalSpawnWordCountRef = useRef(0);
  const flagCounterRef = useRef(0);

  // Crossword puzzle state
  const [puzzle, setPuzzle] = useState(null);
  const [solvedWords, setSolvedWords] = useState([]); // Array of strings e.g. ['FARM']
  const [revealedLetters, setRevealedLetters] = useState({}); // "r,c" -> letter
  const [activeWord, setActiveWord] = useState(null);
  const [keyboardLetters, setKeyboardLetters] = useState([]);
  const [messageToast, setMessageToast] = useState(null);

  // Mascot state
  const [mascotTip, setMascotTip] = useState('Tap letters to solve crossword words!');
  const [mascotMood, setMascotMood] = useState('happy');

  // Victory state
  const [isVictory, setIsVictory] = useState(false);
  const [victoryStats, setVictoryStats] = useState({ stars: 3, timeBonus: 0, finalScore: 0 });

  // Audio settings
  const [sfxVolume, setSfxVolume] = useState(0.8);
  const [sfxMuted, setSfxMuted] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.5);
  const [musicMuted, setMusicMuted] = useState(false);

  // Flutter Bridge Debug Overlay
  const [showBridgeDebug, setShowBridgeDebug] = useState(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('debug_bridge') === 'true';
    } catch (e) {
      return false;
    }
  });

  // 1. Fetch crossword_words.json on load
  useEffect(() => {
    fetch('./data/crossword_words.json')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setWordsPool(data);
        }
      })
      .catch((err) => {
        console.error('Failed to load crossword_words.json', err);
      });
  }, []);

  // 2. Setup Flutter Bridge listeners (Ignored/disconnected for now)
  /*
  useEffect(() => {
    flutterBridge.init({
      gameId: 'stc_grade3_crossword',
      gameTitle: 'Grade 3 Crossword Quest',
      debug: showBridgeDebug
    });

    const offPause = flutterBridge.on('PAUSE', () => {
      setShowPause(true);
      setIsGameActive(false);
    });

    const offResume = flutterBridge.on('RESUME', () => {
      setShowPause(false);
      setIsGameActive(true);
    });

    const offRestart = flutterBridge.on('RESTART', () => {
      startNewGame();
    });

    return () => {
      offPause();
      offResume();
      offRestart();
    };
  }, [showBridgeDebug]);
  */

  // Show temporary toast (e.g., "Already Found!", "Word Solved!")
  const showToast = (text, type = 'info') => {
    setMessageToast({ text, type });
    setTimeout(() => {
      setMessageToast(null);
    }, 1500);
  };

  // Ref for wordsPool to guarantee freshest pool across async/callbacks
  const wordsPoolRef = useRef(wordsPool);
  useEffect(() => {
    wordsPoolRef.current = wordsPool;
  }, [wordsPool]);

  // Set of word IDs already used across rounds to ensure brand new questions every round
  const usedWordIdsRef = useRef(new Set());

  // Additive Learning Pattern Store (Spaced Repetition):
  // - scheduledFailedWordsRef: Map of wordId -> dueRound (scheduled for round +2 or +3)
  // - masteredWordIdsRef: words solved with little/no error (spawned much less often)
  // - roundWordErrorsRef: tracks errors per word in the current round
  const scheduledFailedWordsRef = useRef(new Map());
  const masteredWordIdsRef = useRef(new Set());
  const roundWordErrorsRef = useRef({});

  // Initialize learning stats from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('stc_crossword_learning_stats');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.scheduledFailed && typeof parsed.scheduledFailed === 'object') {
          scheduledFailedWordsRef.current = new Map(
            Object.entries(parsed.scheduledFailed).map(([k, v]) => [Number(k), Number(v)])
          );
        } else if (Array.isArray(parsed.failed)) {
          // Migration from previous set: schedule for round + 2
          scheduledFailedWordsRef.current = new Map(parsed.failed.map((id) => [Number(id), 2]));
        }
        if (Array.isArray(parsed.mastered)) masteredWordIdsRef.current = new Set(parsed.mastered);
      }
    } catch (e) {
      console.warn('Could not load learning stats:', e);
    }
  }, []);

  const saveLearningStats = useCallback(() => {
    try {
      const scheduledObj = {};
      scheduledFailedWordsRef.current.forEach((dueRound, id) => {
        scheduledObj[id] = dueRound;
      });
      localStorage.setItem(
        'stc_crossword_learning_stats',
        JSON.stringify({
          scheduledFailed: scheduledObj,
          mastered: Array.from(masteredWordIdsRef.current)
        })
      );
    } catch (e) {
      console.warn('Could not save learning stats:', e);
    }
  }, []);

  // Helper to schedule a failed/high-error word for the 2nd or 3rd round in the future
  const scheduleWordForFutureReview = useCallback((wordId, fromRound) => {
    // Pick 2 or 3 rounds delay
    const delay = Math.random() < 0.5 ? 2 : 3;
    const dueRound = fromRound + delay;
    scheduledFailedWordsRef.current.set(wordId, dueRound);
    masteredWordIdsRef.current.delete(wordId);
  }, []);

  // Track state in refs to prevent stale closures in async handlers
  const roundRef = useRef(round);
  useEffect(() => {
    roundRef.current = round;
  }, [round]);

  useEffect(() => {
    heartsRef.current = hearts;
  }, [hearts]);

  const scoreRef = useRef(score);
  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  // Track if round transition is already in progress to prevent duplicate triggers
  const isAdvancingRef = useRef(false);

  // Start or transition to a specific round with fresh random word spawns
  const startRound = useCallback(
    (roundNum) => {
      const currentPool = wordsPoolRef.current;
      if (!currentPool || currentPool.length === 0) {
        console.warn('wordsPool is empty, cannot start round');
        isAdvancingRef.current = false;
        return;
      }

      // Explicitly sync round state with roundNum
      const targetRound = typeof roundNum === 'number' ? roundNum : 1;
      setRound(targetRound);
      roundRef.current = targetRound;

      // Reset round word errors for accurate mastery evaluation
      roundWordErrorsRef.current = {};

      // Determine due priority words (scheduled for this round or earlier) and cooling-down words
      const duePriorityIds = new Set();
      const coolingDownIds = new Set();

      scheduledFailedWordsRef.current.forEach((dueRound, id) => {
        if (dueRound <= targetRound) {
          duePriorityIds.add(id);
        } else {
          // Do NOT re-spawn in right next round! Cooldown until round +2 or +3
          coolingDownIds.add(id);
        }
      });

      // Exclude recently used words AND words cooling down for future rounds
      const effectiveExcludeIds = new Set([...usedWordIdsRef.current, ...coolingDownIds]);

      // If used word IDs pool is nearing exhaustion, recycle pool for unlimited gameplay
      if (usedWordIdsRef.current.size >= Math.max(1, currentPool.length - 6)) {
        usedWordIdsRef.current.clear();
      }

      // Pick words count (e.g. 4 for round 1, ramping up to 6)
      const targetCount = Math.min(4 + Math.floor((targetRound - 1) / 2), 6);
      let generated = generateCrosswordPuzzle(
        currentPool,
        targetCount,
        effectiveExcludeIds,
        {
          priorityWordIds: duePriorityIds,
          masteredWordIds: masteredWordIdsRef.current
        }
      );

      if (!generated) {
        usedWordIdsRef.current.clear();
        generated = generateCrosswordPuzzle(
          currentPool,
          targetCount,
          coolingDownIds,
          {
            priorityWordIds: duePriorityIds,
            masteredWordIds: masteredWordIdsRef.current
          }
        );
      }

      if (generated) {
        // Record newly placed word IDs so subsequent rounds get completely fresh questions
        generated.words.forEach((w) => {
          if (w.id) usedWordIdsRef.current.add(w.id);
        });

        isAdvancingRef.current = false;
        setPuzzle(generated);
        setSolvedWords([]);
        setRevealedLetters({});

        // Completion tracking system:
        // Set total spawned words integer counter
        const spawnedCount = generated.words.length;
        setTotalSpawnWordCount(spawnedCount);
        totalSpawnWordCountRef.current = spawnedCount;

        // Reset solved words flagCounter to 0
        setFlagCounter(0);
        flagCounterRef.current = 0;

        // Collect all distinct letters across the puzzle
        const puzzleLetters = Array.from(
          new Set(generated.words.flatMap((w) => w.clean.split('')))
        );

        // Add extra distractor/decoy alphabets to keep the game challenging and confusing
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        const unusedLetters = alphabet.filter((ch) => !puzzleLetters.includes(ch));
        const distractorCount = GAME_CONFIG.EXTRA_DISTRACTOR_LETTERS || 3;
        const shuffledUnused = [...unusedLetters].sort(() => Math.random() - 0.5);
        const distractors = shuffledUnused.slice(0, distractorCount);

        const allLettersInPuzzle = Array.from(new Set([...puzzleLetters, ...distractors])).sort();
        setKeyboardLetters(allLettersInPuzzle);
        setActiveWord(generated.words[0]);
        setHintsRemaining(GAME_CONFIG.HINTS_PER_ROUND || 3);
        setHearts(GAME_CONFIG.MAX_HEARTS || 5);
        heartsRef.current = GAME_CONFIG.MAX_HEARTS || 5;
        setMascotMood('happy');
        setMascotTip(`Round ${targetRound}: Solve all ${spawnedCount} words to clear the round!`);
      } else {
        isAdvancingRef.current = false;
      }
    },
    []
  );

  // When round changes / all words completed: advance to next round with fresh random questions!
  // Unlimited rounds continue until the player runs out of hearts (Game Over)
  const handleNextRound = useCallback(() => {
    if (isAdvancingRef.current) return;
    isAdvancingRef.current = true;

    setRound((prevRound) => {
      const nextR = prevRound + 1;
      roundRef.current = nextR;
      showToast(`🎉 Round Complete! Round ${nextR} Starting...`, 'success');
      if (typeof audio.playVictory === 'function') audio.playVictory();

      // Trigger next round generation with fresh wordspawns
      setTimeout(() => {
        startRound(nextR);
      }, 400);

      return nextR;
    });
  }, [startRound]);

  const handleNextRoundRef = useRef(handleNextRound);
  useEffect(() => {
    handleNextRoundRef.current = handleNextRound;
  }, [handleNextRound]);

  // Proceed to next round from RoundCompleteModal
  const handleProceedToNextRound = useCallback(() => {
    setShowRoundComplete(false);
    handleNextRound();
  }, [handleNextRound]);

  // Start fresh game
  const startNewGame = useCallback(() => {
    isAdvancingRef.current = false;
    usedWordIdsRef.current.clear();
    setRound(1);
    roundRef.current = 1;
    setScore(0);
    setHearts(GAME_CONFIG.MAX_HEARTS || 5);
    heartsRef.current = GAME_CONFIG.MAX_HEARTS || 5;
    setFlagCounter(0);
    flagCounterRef.current = 0;
    setShowRoundComplete(false);
    setShowGameOver(false);
    setIsVictory(false);
    setShowPause(false);
    setScene('GAME');
    setIsGameActive(true);
    audio.startBGM();
    startRound(1);
    // flutterBridge.sendGameStart();
  }, [startRound]);

  // Handle single letter click from LetterKeyboard:
  // If letter matches any position in activeWord (or any puzzle word), reveal it!
  const handleLetterClick = (letter) => {
    if (!puzzle || !letter) return;
    const cleanLetter = letter.toUpperCase();

    // Check against activeWord first, or against all unsolved words in the crossword
    let newlyRevealed = 0;
    const nextRevealed = { ...revealedLetters };

    // Check if the letter exists in activeWord
    let matchedInActive = false;
    if (activeWord && !solvedWords.includes(activeWord.clean)) {
      for (let i = 0; i < activeWord.clean.length; i++) {
        if (activeWord.clean[i] === cleanLetter) {
          const r = activeWord.direction === 'across' ? activeWord.startRow : activeWord.startRow + i;
          const c = activeWord.direction === 'across' ? activeWord.startCol + i : activeWord.startCol;
          const key = `${r},${c}`;
          if (!nextRevealed[key]) {
            nextRevealed[key] = cleanLetter;
            newlyRevealed++;
            matchedInActive = true;
          }
        }
      }
    }

    // If not in active word (or active word already has it), check other unsolved words
    if (newlyRevealed === 0) {
      puzzle.words.forEach((w) => {
        if (!solvedWords.includes(w.clean)) {
          for (let i = 0; i < w.clean.length; i++) {
            if (w.clean[i] === cleanLetter) {
              const r = w.direction === 'across' ? w.startRow : w.startRow + i;
              const c = w.direction === 'across' ? w.startCol + i : w.startCol;
              const key = `${r},${c}`;
              if (!nextRevealed[key]) {
                nextRevealed[key] = cleanLetter;
                newlyRevealed++;
              }
            }
          }
        }
      });
    }

    if (newlyRevealed > 0) {
      // Letter found!
      audio.playMatch();
      setRevealedLetters(nextRevealed);

      // Check which words are now completely revealed
      const newlyCompletedWords = [];
      puzzle.words.forEach((w) => {
        if (!solvedWords.includes(w.clean)) {
          let complete = true;
          for (let i = 0; i < w.clean.length; i++) {
            const r = w.direction === 'across' ? w.startRow : w.startRow + i;
            const c = w.direction === 'across' ? w.startCol + i : w.startCol;
            if (!nextRevealed[`${r},${c}`]) {
              complete = false;
              break;
            }
          }
          if (complete) {
            newlyCompletedWords.push(w.clean);
          }
        }
      });

      const nextSolved = [...solvedWords, ...newlyCompletedWords];
      if (newlyCompletedWords.length > 0) {
        setSolvedWords(nextSolved);

        // Additive Learning Pattern:
        // Evaluate errors for each newly completed word.
        // Words solved with <= 1 error graduate to mastered (spawned less often).
        // Words with multiple errors are scheduled for reinforcement in the 2nd or 3rd round.
        const currentRound = roundRef.current || 1;
        puzzle.words.forEach((pw) => {
          if (newlyCompletedWords.includes(pw.clean) && pw.id) {
            const errs = roundWordErrorsRef.current[pw.clean] || 0;
            if (errs <= 1) {
              masteredWordIdsRef.current.add(pw.id);
              scheduledFailedWordsRef.current.delete(pw.id);
            } else {
              scheduleWordForFutureReview(pw.id, currentRound);
            }
          }
        });
        saveLearningStats();

        // Completion tracking: increase flagCounter when each word is solved
        const newFlagCounter = flagCounterRef.current + newlyCompletedWords.length;
        flagCounterRef.current = newFlagCounter;
        setFlagCounter(newFlagCounter);

        const earned = (GAME_CONFIG.SCORE_PER_WORD || 3) * newlyCompletedWords.length;
        const newScore = score + earned;
        setScore(newScore);
        // flutterBridge.sendScore(newScore);

        showToast(
          `🎉 Word Solved: ${newlyCompletedWords.join(', ')}! +${earned} Points`,
          'success'
        );
        setMascotMood('celebrating');
        setMascotTip(`Awesome! Solved ${newlyCompletedWords[0]}! (${newFlagCounter}/${totalSpawnWordCountRef.current})`);

        // Switch to next unsolved word
        const nextUnsolved = puzzle.words.find((w) => !nextSolved.includes(w.clean));
        if (nextUnsolved) {
          setActiveWord(nextUnsolved);
        }

        // Completion check: all words solved -> Show Round Completed Pop-up!
        if (newFlagCounter >= totalSpawnWordCountRef.current) {
          setSolvedWords(puzzle.words.map((w) => w.clean));
          if (typeof audio.playVictory === 'function') audio.playVictory();
          setRoundCompleteData({
            round: roundRef.current,
            wordsCount: totalSpawnWordCountRef.current,
            words: puzzle.words.map((w) => w.clean),
            score: newScore
          });
          setShowRoundComplete(true);
          return;
        }
      } else {
        // Individual letter hit (points are awarded for complete word matches)
        showToast(`Letter "${cleanLetter}" revealed!`, 'success');
        setMascotMood('happy');
      }

      // Fallback check if all cells are filled
      let allCellsFilled = true;
      for (let r = 0; r < puzzle.rows; r++) {
        for (let c = 0; c < puzzle.cols; c++) {
          if (puzzle.matrix[r][c] && !nextRevealed[`${r},${c}`]) {
            allCellsFilled = false;
            break;
          }
        }
        if (!allCellsFilled) break;
      }

      if (allCellsFilled && flagCounterRef.current < totalSpawnWordCountRef.current) {
        flagCounterRef.current = totalSpawnWordCountRef.current;
        setFlagCounter(totalSpawnWordCountRef.current);
        setSolvedWords(puzzle.words.map((w) => w.clean));
        if (typeof audio.playVictory === 'function') audio.playVictory();
        setRoundCompleteData({
          round: roundRef.current,
          wordsCount: totalSpawnWordCountRef.current,
          words: puzzle.words.map((w) => w.clean),
          score: score
        });
        setShowRoundComplete(true);
      }
    } else {
      // Not present or already revealed -> Wrong letter guess!
      // Additive Learning: record mistake on the word being attempted
      if (activeWord) {
        roundWordErrorsRef.current[activeWord.clean] =
          (roundWordErrorsRef.current[activeWord.clean] || 0) + 1;
      }

      audio.playMismatch();
      setHeartShake(true);
      setTimeout(() => setHeartShake(false), 450);

      setHearts((prevHearts) => {
        const nextHearts = Math.max(0, prevHearts - 1);
        heartsRef.current = nextHearts;
        if (nextHearts <= 0) {
          // Out of hearts -> Game Over!
          // Additive Learning: schedule all remaining unsolved words for the next 2nd or 3rd round
          const curRound = roundRef.current || 1;
          puzzle.words.forEach((pw) => {
            if (!solvedWords.includes(pw.clean) && pw.id) {
              scheduleWordForFutureReview(pw.id, curRound);
            }
          });
          saveLearningStats();

          setIsGameActive(false);
          audio.stopBGM();
          if (typeof audio.playGameOver === 'function') {
            audio.playGameOver();
          }
          setShowGameOver(true);
          return 0;
        }
        showToast(`❌ Letter "${cleanLetter}" not in words! -1 Heart (${nextHearts} left) ❤️`, 'error');
        setMascotMood('thinking');
        return nextHearts;
      });
    }
  };

  // Hint button: reveal 1 random unrevealed letter of the active word
  const handleUseHint = () => {
    if (hintsRemaining <= 0 || !puzzle || !activeWord) return;

    // Find all unrevealed coordinates of activeWord
    const unrevealedCoords = [];
    for (let i = 0; i < activeWord.clean.length; i++) {
      const r = activeWord.direction === 'across' ? activeWord.startRow : activeWord.startRow + i;
      const c = activeWord.direction === 'across' ? activeWord.startCol + i : activeWord.startCol;
      const key = `${r},${c}`;
      if (!solvedWords.includes(activeWord.clean) && !revealedLetters[key]) {
        unrevealedCoords.push({ r, c, key, char: activeWord.clean[i] });
      }
    }

    if (unrevealedCoords.length === 0) {
      // Find any unsolved word cell across the whole puzzle
      puzzle.words.forEach((w) => {
        if (!solvedWords.includes(w.clean)) {
          for (let i = 0; i < w.clean.length; i++) {
            const r = w.direction === 'across' ? w.startRow : w.startRow + i;
            const c = w.direction === 'across' ? w.startCol + i : w.startCol;
            const key = `${r},${c}`;
            if (!revealedLetters[key]) {
              unrevealedCoords.push({ r, c, key, char: w.clean[i] });
            }
          }
        }
      });
    }

    if (unrevealedCoords.length > 0) {
      const picked = unrevealedCoords[Math.floor(Math.random() * unrevealedCoords.length)];
      audio.playHint();
      setHintsRemaining((h) => h - 1);
      const nextRevealed = {
        ...revealedLetters,
        [picked.key]: picked.char
      };
      setRevealedLetters(nextRevealed);
      setMascotMood('happy');
      setMascotTip(`Hint revealed letter "${picked.char}"!`);

      // Check if any word got completed by this hint
      const newlyCompletedWords = [];
      puzzle.words.forEach((w) => {
        if (!solvedWords.includes(w.clean)) {
          let complete = true;
          for (let i = 0; i < w.clean.length; i++) {
            const r = w.direction === 'across' ? w.startRow : w.startRow + i;
            const c = w.direction === 'across' ? w.startCol + i : w.startCol;
            if (!nextRevealed[`${r},${c}`]) {
              complete = false;
              break;
            }
          }
          if (complete) {
            newlyCompletedWords.push(w.clean);
          }
        }
      });

      if (newlyCompletedWords.length > 0) {
        const nextSolved = [...solvedWords, ...newlyCompletedWords];
        setSolvedWords(nextSolved);

        // Completion tracking: increase flagCounter when words are solved via hint
        const newFlagCounter = flagCounterRef.current + newlyCompletedWords.length;
        flagCounterRef.current = newFlagCounter;
        setFlagCounter(newFlagCounter);

        showToast(
          `🎉 Word Solved: ${newlyCompletedWords.join(', ')}! (${newFlagCounter}/${totalSpawnWordCountRef.current})`,
          'success'
        );

        // Completion check: all words solved via hint -> Show Round Completed Pop-up!
        if (newFlagCounter >= totalSpawnWordCountRef.current) {
          setSolvedWords(puzzle.words.map((w) => w.clean));
          if (typeof audio.playVictory === 'function') audio.playVictory();
          setRoundCompleteData({
            round: roundRef.current,
            wordsCount: totalSpawnWordCountRef.current,
            words: puzzle.words.map((w) => w.clean),
            score: score
          });
          setShowRoundComplete(true);
        }
      }
    }
  };

  // Shuffle letters on the keyboard
  const handleShuffleLetters = () => {
    setKeyboardLetters((prev) => [...prev].sort(() => Math.random() - 0.5));
  };

  // Top Left Toolbar Buttons
  const topButtons = [
    {
      id: 'pause',
      icon: '⏸️',
      title: 'Pause Game',
      onClick: () => {
        audio.playSelect();
        setShowPause(true);
        setIsGameActive(false);
      }
    },
    {
      id: 'settings',
      icon: '⚙️',
      title: 'Settings',
      onClick: () => setShowSettings(true)
    }
  ];

  return (
    <AspectRatioContainer>
      {/* Background with subtle animation */}
      <HimalayanBackground />

      {/* Main Menu Scene */}
      {scene === 'MENU' && (
        <MainMenu
          onPlay={startNewGame}
          onStartGame={startNewGame}
          onHowToPlay={() => setShowHowToPlay(true)}
          onSettings={() => setShowSettings(true)}
        />
      )}

      {/* Crossword Gameplay Scene */}
      {scene === 'GAME' && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            position: 'relative',
            zIndex: 10,
            overflow: 'hidden'
          }}
        >
          {/* Top HUD Bar (Aligned to Y: 100px as per UI Layout Rule) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '60px 44px 20px 60px',
              zIndex: 120, // Layer 1: UI_BUTTONS
              boxSizing: 'border-box'
            }}
          >
            {/* Top-Left Action Buttons (Slots: 0 -> (100, 100), 1 -> (220, 100), Spacing 120px, Size 80x80) */}
            <div style={{ display: 'flex', gap: '40px', alignItems: 'center', marginTop: '-100px' }}>
              {topButtons.map((btn) => (
                <button
                  key={btn.id}
                  onClick={btn.onClick}
                  title={btn.title}
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(15, 23, 42, 0.85)',
                    border: '4px solid rgba(255, 255, 255, 0.35)',
                    color: '#ffffff',
                    fontSize: '34px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  {btn.icon}
                </button>
              ))}
            </div>

            {/* Top-Centered Words Completion Tracker (Enlarged 2-Line Text) */}
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: '120px',
                transform: 'translate(-50%, -50%)',
                background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
                color: '#ffffff',
                padding: '12px 38px',
                borderRadius: '36px',
                boxShadow: '0 12px 32px rgba(16, 185, 129, 0.45)',
                border: '5px solid #6ee7b7',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                whiteSpace: 'nowrap',
                zIndex: 125
              }}
              title={`Completion Tracker: ${flagCounter} of ${totalSpawnWordCount} words solved`}
            >
              {/* Line 1: WORDS */}
              <div
                style={{
                  fontSize: '26px',
                  fontWeight: '900',
                  letterSpacing: '2.5px',
                  textTransform: 'uppercase',
                  opacity: 0.95,
                  lineHeight: 1.1
                }}
              >
                WORDS
              </div>

              {/* Line 2: 0/4 and Progress Bar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  marginTop: '4px'
                }}
              >
                <span
                  style={{
                    fontSize: '44px',
                    fontWeight: '900',
                    lineHeight: 1.1
                  }}
                >
                  {flagCounter}/{totalSpawnWordCount}
                </span>
                {/* Mini progress bar */}
                <div
                  style={{
                    width: '96px',
                    height: '18px',
                    backgroundColor: 'rgba(0, 0, 0, 0.35)',
                    borderRadius: '9px',
                    overflow: 'hidden',
                    border: '2px solid rgba(255, 255, 255, 0.35)'
                  }}
                >
                  <div
                    style={{
                      width: `${totalSpawnWordCount > 0 ? Math.min(100, Math.round((flagCounter / totalSpawnWordCount) * 100)) : 0}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #34d399, #10b981)',
                      borderRadius: '9px',
                      transition: 'width 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Top-Right HUD Stats: Points on top, Hearts row below */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '14px', zIndex: 125 }}>
              {/* Points Badge (Top row, enlarged text) */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: '#ffffff',
                  padding: '14px 36px',
                  borderRadius: '44px',
                  fontSize: '40px',
                  fontWeight: '900',
                  letterSpacing: '1px',
                  boxShadow: '0 12px 32px rgba(245, 158, 11, 0.4)',
                  border: '5px solid #fde68a',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  whiteSpace: 'nowrap'
                }}
              >
                <span style={{ fontSize: '36px', opacity: 0.95 }}>POINTS:</span>
                <span style={{ fontSize: '42px' }}>{score}</span>
              </div>

              {/* Hearts Badge (Row below Points, enlarged hearts) */}
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(15, 23, 42, 0.85) 100%)',
                  color: '#f8fafc',
                  padding: '14px 30px',
                  borderRadius: '44px',
                  boxShadow: '0 12px 30px rgba(239, 68, 68, 0.3)',
                  border: '5px solid rgba(248, 113, 113, 0.7)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  marginTop: '35px',
                  animation: heartShake ? 'heartShakeAnim 0.4s ease-in-out' : 'none',
                  whiteSpace: 'nowrap'
                }}
                title={`Lives remaining: ${hearts} of ${GAME_CONFIG.MAX_HEARTS || 5}`}
              >
                <style>{`
                  @keyframes heartShakeAnim {
                    0%, 100% { transform: translateX(0); }
                    20%, 60% { transform: translateX(-6px) scale(1.05); }
                    40%, 80% { transform: translateX(6px) scale(1.05); }
                  }
                `}</style>
                {Array.from({ length: GAME_CONFIG.MAX_HEARTS || 5 }).map((_, idx) => {
                  const isAlive = idx < hearts;
                  return (
                    <span
                      key={idx}
                      style={{
                        fontSize: '44px',
                        display: 'inline-block',
                        transform: isAlive ? 'scale(1)' : 'scale(0.85)',
                        filter: isAlive
                          ? 'drop-shadow(0 2px 6px rgba(239, 68, 68, 0.6))'
                          : 'grayscale(100%) opacity(0.3)',
                        transition: 'all 0.25s ease'
                      }}
                    >
                      {isAlive ? '❤️' : '🤍'}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Center Area: Crossword Grid */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              margin: '6px 0',
              position: 'relative'
            }}
          >
            {/* Temporary Notification Toast */}
            {messageToast && (
              <div
                style={{
                  position: 'absolute',
                  top: '10px',
                  background:
                    messageToast.type === 'success'
                      ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                      : messageToast.type === 'error'
                        ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                        : 'linear-gradient(135deg, #f59e0b, #d97706)',
                  color: '#ffffff',
                  padding: '12px 32px',
                  borderRadius: '30px',
                  fontSize: '24px',
                  fontWeight: '900',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
                  zIndex: 50,
                  animation: 'popIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}
              >
                {messageToast.text}
              </div>
            )}

            {puzzle ? (
              <CrosswordGrid
                gridData={puzzle}
                solvedWords={solvedWords}
                revealedLetters={revealedLetters}
                activeWord={activeWord}
                onSelectWord={(w) => setActiveWord(w)}
              />
            ) : (
              <div style={{ fontSize: '28px', color: '#ffffff', fontWeight: '800' }}>
                Loading Crossword Puzzle...
              </div>
            )}
          </div>

          {/* Word Completion Tracking List Pills (2 columns x 2 rows) */}
          {puzzle && puzzle.words && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px 18px',
                width: '920px',
                maxWidth: '92%',
                margin: '0 auto 14px auto',
                zIndex: 20
              }}
            >
              {puzzle.words.map((w, idx) => {
                const isSolved = solvedWords.includes(w.clean);
                const isActive = activeWord && activeWord.uid === w.uid;
                return (
                  <button
                    key={w.uid || `${w.clean}-${idx}`}
                    onClick={() => {
                      audio.playSelect();
                      setActiveWord(w);
                    }}
                    style={{
                      background: isSolved
                        ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                        : isActive
                          ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                          : 'rgba(15, 23, 42, 0.85)',
                      color: '#ffffff',
                      border: isSolved
                        ? '3px solid #6ee7b7'
                        : isActive
                          ? '3px solid #fde68a'
                          : '3px solid rgba(255, 255, 255, 0.25)',
                      borderRadius: '28px',
                      padding: '12px 20px',
                      width: '100%',
                      boxSizing: 'border-box',
                      fontSize: '32px',
                      fontWeight: '900',
                      letterSpacing: '0.8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      boxShadow: isActive || isSolved ? '0 8px 20px rgba(0,0,0,0.4)' : '0 4px 12px rgba(0,0,0,0.25)',
                      transform: isActive ? 'scale(1.03)' : 'scale(1)',
                      transition: 'all 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)'
                    }}
                  >
                    <span style={{ fontSize: isSolved ? '26px' : '32px' }}>{isSolved ? '✅' : `${w.number}.`}</span>
                    <span>{isSolved ? w.clean : `${w.direction.toUpperCase()} (${w.length})`}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Active Word Clue Card */}
          <ClueCard
            activeWord={activeWord}
            onHintClick={handleUseHint}
            hintsRemaining={hintsRemaining}
          />

          {/* Bottom Area: Letter Keyboard (Row / Column Grid) */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '28px',
              zIndex: 20
            }}
          >
            <LetterKeyboard
              letters={keyboardLetters}
              onLetterClick={handleLetterClick}
              onShuffle={handleShuffleLetters}
              activeWord={activeWord}
              disabled={!isGameActive || showPause || isVictory}
            />
          </div>

          {/* Mascot in bottom left corner with speech tip */}
          {/* <Mascot tip={mascotTip} mood={mascotMood} /> */}
        </div>
      )}

      {/* How to Play Modal */}
      {showHowToPlay && (
        <HowToPlayModal
          onClose={() => {
            audio.playSelect();
            setShowHowToPlay(false);
          }}
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          onClose={() => {
            audio.playSelect();
            setShowSettings(false);
          }}
          sfxVolume={sfxVolume}
          setSfxVolume={(v) => {
            setSfxVolume(v);
            audio.setSfxVolume(v);
          }}
          sfxMuted={sfxMuted}
          setSfxMuted={(m) => {
            setSfxMuted(m);
            audio.toggleSfxMute();
          }}
          musicVolume={musicVolume}
          setMusicVolume={(v) => {
            setMusicVolume(v);
            audio.setMusicVolume(v);
          }}
          musicMuted={musicMuted}
          setMusicMuted={(m) => {
            setMusicMuted(m);
            audio.toggleMusicMute();
          }}
        />
      )}

      {/* Pause Modal */}
      {showPause && (
        <PauseModal
          onResume={() => {
            audio.playSelect();
            setShowPause(false);
            setIsGameActive(true);
          }}
          onRestart={() => {
            audio.playSelect();
            startNewGame();
          }}
          onQuit={() => {
            audio.playSelect();
            setShowPause(false);
            setIsGameActive(false);
            setScene('MENU');
            audio.stopBGM();
          }}
        />
      )}

      {/* Round Completed Modal Pop-up */}
      {showRoundComplete && (
        <RoundCompleteModal
          round={roundCompleteData.round}
          totalRounds={TOTAL_ROUNDS}
          wordsCount={roundCompleteData.wordsCount}
          words={roundCompleteData.words}
          score={score}
          onNextRound={handleProceedToNextRound}
        />
      )}

      {/* Game Over Modal */}
      {showGameOver && (
        <GameOverModal
          round={round}
          totalRounds={TOTAL_ROUNDS}
          flagCounter={flagCounter}
          totalSpawnWordCount={totalSpawnWordCount}
          score={score}
          onRetry={() => {
            setShowGameOver(false);
            setHearts(GAME_CONFIG.MAX_HEARTS || 5);
            heartsRef.current = GAME_CONFIG.MAX_HEARTS || 5;
            setIsGameActive(true);
            audio.startBGM();
            startRound(roundRef.current);
          }}
          onHome={() => {
            setShowGameOver(false);
            setIsGameActive(false);
            setScene('MENU');
            audio.stopBGM();
          }}
        />
      )}

      {/* Victory Modal */}
      {isVictory && (
        <VictoryModal
          score={victoryStats.finalScore}
          xp={victoryStats.finalScore}
          timeBonus={victoryStats.timeBonus}
          baseScore={score}
          stars={victoryStats.stars}
          heartsRemaining={hearts}
          maxHearts={GAME_CONFIG.MAX_HEARTS || 5}
          levelTitle="Crossword Quest Master"
          onReplay={() => {
            startNewGame();
          }}
          onHome={() => {
            setIsVictory(false);
            setScene('MENU');
          }}
        />
      )}

      {/* Flutter Bridge Debug Overlay */}
      {showBridgeDebug && (
        <BridgeDebugOverlay
          onClose={() => setShowBridgeDebug(false)}
          onSimulateCommand={(cmd, data) => {
            console.log('[Debug] Simulated command:', cmd, data);
          }}
        />
      )}
    </AspectRatioContainer>
  );
}
