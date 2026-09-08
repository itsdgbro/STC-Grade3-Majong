import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AspectRatioContainer } from './components/AspectRatioContainer';
import { HimalayanBackground } from './components/HimalayanBackground';
import { MainMenu } from './components/MainMenu';
import { LevelSelect } from './components/LevelSelect';
import { HowToPlayModal } from './components/HowToPlayModal';
import { SettingsModal } from './components/SettingsModal';
import { PauseModal } from './components/PauseModal';
import { GlobalTopBar } from './components/GlobalTopBar';
import { Tile } from './components/Tile';
import { Mascot } from './components/Mascot';
import { VictoryModal } from './components/VictoryModal';
import { LEVELS } from './data/gameData';
import { 
  getFreeTiles, 
  getAvailableFreePairs, 
  generateSolutionFirstPuzzle, 
  findSolvableHint 
} from './utils/mahjongEngine';
import { audio } from './utils/audio';

export default function App() {
  // Navigation Scene State: 'MENU' | 'LEVEL_SELECT' | 'GAME'
  const [scene, setScene] = useState('MENU');
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPause, setShowPause] = useState(false);
  
  // Persistent level stars & progress
  const [levelProgress, setLevelProgress] = useState(() => {
    try {
      const saved = localStorage.getItem('stc_mahjong_progress');
      return saved ? JSON.parse(saved) : { 1: { stars: 0, highScore: 0, completed: false } };
    } catch (e) {
      return { 1: { stars: 0, highScore: 0, completed: false } };
    }
  });

  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [tiles, setTiles] = useState([]);
  const [selectedTileId, setSelectedTileId] = useState(null);
  const [hintedPairIds, setHintedPairIds] = useState([]);
  const [mismatchedIds, setMismatchedIds] = useState([]);
  const [matchedIds, setMatchedIds] = useState([]);
  const [justUnlockedIds, setJustUnlockedIds] = useState([]);
  const [moveHistory, setMoveHistory] = useState([]);
  const [score, setScore] = useState(0);
  const [hintsRemaining, setHintsRemaining] = useState(3);
  const [mascotTip, setMascotTip] = useState('');
  const [mascotMood, setMascotMood] = useState('happy');
  const [isVictory, setIsVictory] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isGameActive, setIsGameActive] = useState(false);
  
  // Audio state
  const [sfxVolume, setSfxVolume] = useState(0.8);
  const [sfxMuted, setSfxMuted] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.5);
  const [musicMuted, setMusicMuted] = useState(false);
  const [speechVolume, setSpeechVolume] = useState(0.7);
  const [speechMuted, setSpeechMuted] = useState(false);

  // Save progress to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('stc_mahjong_progress', JSON.stringify(levelProgress));
    } catch (e) {
      console.warn('Could not save progress', e);
    }
  }, [levelProgress]);

  const level = LEVELS[currentLevelIndex];

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

  // Initialize level
  const startLevel = useCallback((levelIdx) => {
    const activeLevel = LEVELS[levelIdx];
    
    // Guaranteed solution-first puzzle
    const generatedTiles = generateSolutionFirstPuzzle(
      activeLevel.layout,
      activeLevel.vocabularyPool
    );

    setTiles(generatedTiles);
    setSelectedTileId(null);
    setHintedPairIds([]);
    setMismatchedIds([]);
    setMatchedIds([]);
    setJustUnlockedIds([]);
    setMoveHistory([]);
    setMascotTip(activeLevel.mascotTip);
    setMascotMood('happy');
    setIsVictory(false);
    setTimer(0);
    setIsGameActive(true);
    setHintsRemaining(3);
  }, []);

  useEffect(() => {
    if (scene === 'GAME') {
      startLevel(currentLevelIndex);
    }
  }, [currentLevelIndex, startLevel, scene]);

  // Timer interval
  useEffect(() => {
    let interval = null;
    if (isGameActive && !isVictory && !showPause && scene === 'GAME') {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isGameActive, isVictory, showPause, scene]);

  // Handle Tile Selection
  const handleTileClick = (tile) => {
    // Strict Mahjong Check
    if (!freeTileIds.has(tile.id)) {
      audio.playMismatch();
      setMascotTip("That tile is trapped! Remove the top or outer side tiles first.");
      return;
    }

    // Pronounce English word
    audio.speakWord(tile.word);

    // First tile selection
    if (!selectedTileId) {
      setSelectedTileId(tile.id);
      audio.playSelect();
      setHintedPairIds([]);
      setMascotTip(`You selected "${tile.word}"! Look for its open ${tile.relation.toLowerCase()}!`);
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
      setMascotMood('correct');

      // Calculate newly uncovered tiles
      const nextActiveTiles = tiles.filter((t) => !newMatched.includes(t.id));
      const nextFreeTiles = getFreeTiles(nextActiveTiles);
      const newlyFreed = nextFreeTiles
        .filter((t) => !previousFree.has(t.id))
        .map((t) => t.id);

      if (newlyFreed.length > 0) {
        setJustUnlockedIds(newlyFreed);
        setTimeout(() => setJustUnlockedIds([]), 900);
        setMascotTip(`Brilliant! "${firstTile.word}" ↔ "${tile.word}" cleared! You uncovered ${newlyFreed.length} new tile${newlyFreed.length > 1 ? 's' : ''}! ✨`);
      } else {
        setMascotTip(`Superb! "${firstTile.word}" ↔ "${tile.word}" are ${firstTile.relation}! ✨`);
      }

      // Check level victory
      if (newMatched.length >= tiles.length) {
        setIsVictory(true);
        setIsGameActive(false);
        audio.playFanfare();
        setMascotMood('celebrating');
        setMascotTip('🎉 Outstanding work! You completed the entire Mahjong board!');

        const earnedStars = timer < 60 ? 3 : timer < 120 ? 2 : 1;
        const currentLvlId = level.id;
        const nextLvlId = LEVELS[currentLevelIndex + 1]?.id;

        setLevelProgress((prev) => {
          const prevLvl = prev[currentLvlId] || { stars: 0, highScore: 0, completed: false };
          const updated = {
            ...prev,
            [currentLvlId]: {
              stars: Math.max(prevLvl.stars, earnedStars),
              highScore: Math.max(prevLvl.highScore, score + 100),
              completed: true
            }
          };
          if (nextLvlId && !updated[nextLvlId]) {
            updated[nextLvlId] = { stars: 0, highScore: 0, completed: false };
          }
          return updated;
        });
      }
    } else {
      // Mismatch
      audio.playMismatch();
      setMismatchedIds([firstTile.id, tile.id]);
      setMascotMood('happy');
      setMascotTip(`"${firstTile.word}" and "${tile.word}" are not a pair. Try again!`);

      setTimeout(() => {
        setMismatchedIds([]);
        setSelectedTileId(null);
      }, 500);
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
      setMascotTip(`💡 Hint: "${tileA.word}" ↔ "${tileB.word}" (${tileA.relation}) are free to match!`);
      audio.speakWord(`${tileA.word} and ${tileB.word}`);
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

  // Board layout bounds
  const minX = Math.min(...level.layout.map((s) => s.x));
  const maxX = Math.max(...level.layout.map((s) => s.x));
  const minY = Math.min(...level.layout.map((s) => s.y));
  const maxY = Math.max(...level.layout.map((s) => s.y));
  const maxZ = Math.max(...level.layout.map((s) => s.z));

  const boardWidth = (maxX - minX) * 86 + 184 + maxZ * 8;
  const boardHeight = (maxY - minY) * 106 + 230 + maxZ * 16;

  const isDeadEnd = activeTiles.length > 0 && availableFreePairs.length === 0 && !isVictory;

  return (
    <AspectRatioContainer>
      {/* Cartoon Himalayan Background */}
      <HimalayanBackground themeGradient={level.bgGradient} />

      {/* Main Menu Scene */}
      {scene === 'MENU' && (
        <>
          {/* Top Left Toolbar: 1 Button (Settings) as per project-rules */}
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
            onPlay={() => {
              setScene('LEVEL_SELECT');
            }}
          />
        </>
      )}

      {/* Level Selection Scene */}
      {scene === 'LEVEL_SELECT' && (
        <>
          {/* Top Left Toolbar: 2 Buttons (Back & Settings) as per project-rules */}
          <GlobalTopBar
            buttons={[
              {
                id: 'back',
                icon: '⬅️',
                title: 'Back to Main Menu',
                onClick: () => setScene('MENU')
              },
              {
                id: 'settings',
                icon: '⚙️',
                title: 'Settings',
                onClick: () => setShowSettings(true)
              }
            ]}
          />

          <LevelSelect
            levelProgress={levelProgress}
            onSelectLevel={(levelIdx) => {
              setCurrentLevelIndex(levelIdx);
              startLevel(levelIdx);
              setScene('GAME');
            }}
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
          speechVolume={speechVolume}
          setSpeechVolume={setSpeechVolume}
          speechMuted={speechMuted}
          setSpeechMuted={setSpeechMuted}
        />
      )}

      {/* Active Game Scene */}
      {scene === 'GAME' && (
        <>
          {/* Top Left Toolbar: Standard 2-Button Mapping (Slot 0: Pause, Slot 1: Settings) as per project-rules */}
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
                startLevel(currentLevelIndex);
              }}
              onQuit={() => {
                setShowPause(false);
                setScene('LEVEL_SELECT');
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
              height: '136px',
              padding: '16px 44px 16px 250px', // Extra left padding for top toolbar
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              zIndex: 80,
              background: 'linear-gradient(180deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 75%, rgba(0,0,0,0) 100%)',
              boxSizing: 'border-box'
            }}
          >
            {/* Left-Center: Level info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <h1
                  style={{
                    fontSize: '34px',
                    fontWeight: '900',
                    color: '#ffffff',
                    textShadow: '0 4px 10px rgba(0,0,0,0.85)',
                    margin: 0,
                    padding: '2px 0',
                    lineHeight: 1.2,
                    letterSpacing: '-0.3px',
                    fontFamily: "'Fredoka', sans-serif"
                  }}
                >
                  {level.title}
                </h1>
                <div
                  style={{
                    fontSize: '20px',
                    fontWeight: '800',
                    color: '#fef08a',
                    textShadow: '0 2px 6px rgba(0,0,0,0.8)',
                    marginTop: '2px',
                    lineHeight: 1.2
                  }}
                >
                  Grade 3 • {level.subtitle}
                </div>
              </div>
            </div>

            {/* Center: Objective Banner with large readable instruction */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.98)',
                padding: '12px 30px',
                borderRadius: '50px',
                border: '4px solid #facc15',
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                maxWidth: '620px'
              }}
            >
              <span style={{ fontSize: '30px' }}>🎯</span>
              <span style={{ fontSize: '22px', fontWeight: '900', color: '#1e293b', lineHeight: '1.25' }}>
                {level.description}
              </span>
            </div>

            {/* Right: Essential HUD */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  background: availableFreePairs.length > 0 ? '#ecfdf5' : '#fef2f2',
                  border: `3px solid ${availableFreePairs.length > 0 ? '#10b981' : '#ef4444'}`,
                  padding: '8px 20px',
                  borderRadius: '20px',
                  textAlign: 'center',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.2)'
                }}
                title="Playable open pairs right now"
              >
                <div style={{ fontSize: '13px', fontWeight: '900', color: availableFreePairs.length > 0 ? '#047857' : '#b91c1c', letterSpacing: '0.8px' }}>
                  OPEN PAIRS
                </div>
                <div style={{ fontSize: '26px', fontWeight: '900', color: availableFreePairs.length > 0 ? '#059669' : '#dc2626' }}>
                  {availableFreePairs.length}
                </div>
              </div>

              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.96)',
                  padding: '8px 20px',
                  borderRadius: '20px',
                  textAlign: 'center',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.2)'
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: '900', color: '#64748b', letterSpacing: '0.8px' }}>SCORE</div>
                <div style={{ fontSize: '26px', fontWeight: '900', color: '#0284c7' }}>{score}</div>
              </div>

              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.96)',
                  padding: '8px 20px',
                  borderRadius: '20px',
                  textAlign: 'center',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.2)'
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: '900', color: '#64748b', letterSpacing: '0.8px' }}>TIME</div>
                <div style={{ fontSize: '26px', fontWeight: '900', color: '#059669' }}>{timer}s</div>
              </div>
            </div>
          </div>

          {/* Main Playing Board - Strictly Centered as a Single Cohesive Giant Unit */}
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

          {/* Gentle Recovery Modal */}
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
                    padding: '16px 30px',
                    borderRadius: '20px',
                    fontWeight: '900',
                    fontSize: '22px',
                    boxShadow: '0 4px 16px rgba(59, 130, 246, 0.4)',
                    cursor: moveHistory.length > 0 ? 'pointer' : 'not-allowed'
                  }}
                >
                  ↩️ Undo Move
                </button>
                <button
                  onClick={handleSmartReorder}
                  style={{
                    background: '#10b981',
                    color: '#ffffff',
                    padding: '16px 30px',
                    borderRadius: '20px',
                    fontWeight: '900',
                    fontSize: '22px',
                    boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4)'
                  }}
                >
                  ✨ Smart Re-Order
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
                padding: '18px 28px',
                borderRadius: '24px',
                border: '4px solid #fde68a',
                boxShadow: '0 8px 26px rgba(217, 119, 6, 0.48)',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                fontSize: '24px',
                fontWeight: '900'
              }}
            >
              <span style={{ fontSize: '30px' }}>💡</span>
              <span>Hint ({hintsRemaining})</span>
            </button>

            <button
              onClick={handleUndo}
              disabled={moveHistory.length === 0}
              style={{
                background: moveHistory.length > 0 ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' : '#94a3b8',
                color: '#ffffff',
                padding: '18px 28px',
                borderRadius: '24px',
                border: `4px solid ${moveHistory.length > 0 ? '#93c5fd' : '#cbd5e1'}`,
                boxShadow: '0 8px 26px rgba(59, 130, 246, 0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                fontSize: '24px',
                fontWeight: '900',
                cursor: moveHistory.length > 0 ? 'pointer' : 'not-allowed'
              }}
            >
              <span style={{ fontSize: '30px' }}>↩️</span>
              <span>Undo</span>
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
              <span>Tiles Cleared:</span>
              <span style={{ color: '#0284c7' }}>
                {matchedIds.length} / {tiles.length}
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

          {/* Victory Modal */}
          {isVictory && (
            <VictoryModal
              score={score}
              timeTaken={timer}
              levelId={level.id}
              levelTitle={level.title}
              stars={timer < 60 ? 3 : timer < 120 ? 2 : 1}
              hasNextLevel={currentLevelIndex < LEVELS.length - 1}
              onNextLevel={() => {
                const nextIdx = currentLevelIndex + 1;
                setCurrentLevelIndex(nextIdx);
                startLevel(nextIdx);
              }}
              onReplay={() => startLevel(currentLevelIndex)}
              onLevelMap={() => setScene('LEVEL_SELECT')}
              onHome={() => setScene('MENU')}
            />
          )}
        </>
      )}
    </AspectRatioContainer>
  );
}
