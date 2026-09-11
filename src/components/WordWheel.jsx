import React, { useState, useRef, useEffect, useCallback } from 'react';
import { audio } from '../utils/audio';

/**
 * Interactive Word Wheel (Wordscapes style)
 * Circular wheel where letters are arranged radially.
 * Users drag or swipe across letters to spell a word.
 */
export const WordWheel = ({
  letters = [], // e.g. ['F', 'A', 'R', 'M']
  onWordSubmitted,
  onShuffle,
  disabled = false
}) => {
  const containerRef = useRef(null);
  const [selectedIndices, setSelectedIndices] = useState([]);
  const [currentWord, setCurrentWord] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [pointerPos, setPointerPos] = useState(null); // {x, y} for trailing drag line

  const WHEEL_SIZE = 420;
  const CENTER = WHEEL_SIZE / 2;
  const RADIUS = 145; // distance of letter centers from middle

  // Compute positions of each letter node on the circle
  const letterNodes = letters.map((letter, idx) => {
    const angle = (idx / letters.length) * 2 * Math.PI - Math.PI / 2;
    const x = CENTER + RADIUS * Math.cos(angle);
    const y = CENTER + RADIUS * Math.sin(angle);
    return { id: idx, letter, x, y };
  });

  const getLetterAtPoint = useCallback(
    (clientX, clientY) => {
      if (!containerRef.current) return null;
      const rect = containerRef.current.getBoundingClientRect();
      const scale = WHEEL_SIZE / rect.width;
      const localX = (clientX - rect.left) * scale;
      const localY = (clientY - rect.top) * scale;

      for (let i = 0; i < letterNodes.length; i++) {
        const node = letterNodes[i];
        const dist = Math.hypot(node.x - localX, node.y - localY);
        // Node radius is 45px, detection hit radius ~50px
        if (dist <= 52) {
          return { index: i, node, localX, localY };
        }
      }
      return { index: null, localX, localY };
    },
    [letterNodes]
  );

  // Add letter via direct tap/click
  const handleLetterClick = (index, e) => {
    if (disabled) return;
    if (e) e.stopPropagation();

    // If already in word, check if it's the last one clicked to remove or allow multi-letter anagrams
    audio.playSelect();
    const updated = [...selectedIndices, index];
    setSelectedIndices(updated);
    setCurrentWord(updated.map((i) => letters[i]).join(''));
  };

  const handleClear = (e) => {
    if (e) e.stopPropagation();
    setSelectedIndices([]);
    setCurrentWord('');
    audio.playSelect();
  };

  const handleSubmit = (e) => {
    if (e) e.stopPropagation();
    if (currentWord.length >= 2 && onWordSubmitted) {
      onWordSubmitted(currentWord);
    }
    setTimeout(() => {
      setSelectedIndices([]);
      setCurrentWord('');
    }, 150);
  };

  const handlePointerDown = (e) => {
    if (disabled) return;
    const hit = getLetterAtPoint(e.clientX, e.clientY);
    if (hit && hit.index !== null) {
      setIsDragging(true);
      setSelectedIndices([hit.index]);
      setCurrentWord(letters[hit.index]);
      setPointerPos({ x: hit.localX, y: hit.localY });
      audio.playSelect();
    }
  };

  const handlePointerMove = (e) => {
    if (!isDragging || disabled) return;
    const hit = getLetterAtPoint(e.clientX, e.clientY);
    if (!hit) return;

    setPointerPos({ x: hit.localX, y: hit.localY });

    if (hit.index !== null) {
      // If we re-hover the previous letter, unwind one step
      if (
        selectedIndices.length > 1 &&
        selectedIndices[selectedIndices.length - 2] === hit.index
      ) {
        const updated = selectedIndices.slice(0, -1);
        setSelectedIndices(updated);
        setCurrentWord(updated.map((i) => letters[i]).join(''));
        audio.playSelect();
      } else if (!selectedIndices.includes(hit.index)) {
        // Add new letter
        const updated = [...selectedIndices, hit.index];
        setSelectedIndices(updated);
        setCurrentWord(updated.map((i) => letters[i]).join(''));
        audio.playSelect();
      }
    }
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    setPointerPos(null);

    // Auto submit if drag had 2 or more letters
    if (currentWord.length >= 2 && onWordSubmitted) {
      onWordSubmitted(currentWord);
    }

    // Reset selection after brief moment
    setTimeout(() => {
      setSelectedIndices([]);
      setCurrentWord('');
    }, 200);
  };

  // Attach global pointerup / pointercancel so release outside wheel still commits
  useEffect(() => {
    const onWindowPointerUp = () => {
      if (isDragging) {
        handlePointerUp();
      }
    };
    window.addEventListener('pointerup', onWindowPointerUp);
    window.addEventListener('pointercancel', onWindowPointerUp);
    return () => {
      window.removeEventListener('pointerup', onWindowPointerUp);
      window.removeEventListener('pointercancel', onWindowPointerUp);
    };
  }, [isDragging, currentWord]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        userSelect: 'none'
      }}
    >
      {/* Word Preview Pill & Action Buttons */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          marginBottom: '20px',
          minHeight: '76px'
        }}
      >
        {/* Clear Button */}
        <button
          onClick={handleClear}
          disabled={disabled || !currentWord}
          title="Clear Word"
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: currentWord ? '#ef4444' : 'rgba(255,255,255,0.1)',
            border: '3px solid rgba(255,255,255,0.3)',
            color: '#ffffff',
            fontSize: '28px',
            fontWeight: '900',
            cursor: currentWord ? 'pointer' : 'default',
            opacity: currentWord ? 1 : 0.4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: currentWord ? '0 6px 16px rgba(239, 68, 68, 0.4)' : 'none',
            transition: 'all 0.15s ease'
          }}
        >
          ✕
        </button>

        {/* Word Preview Pill */}
        <div
          onClick={currentWord.length >= 2 ? handleSubmit : undefined}
          style={{
            minHeight: '76px',
            minWidth: '240px',
            padding: '8px 28px',
            backgroundColor: currentWord ? 'rgba(15, 23, 42, 0.9)' : 'rgba(15, 23, 42, 0.4)',
            borderRadius: '38px',
            border: currentWord ? '3px solid #38bdf8' : '3px dashed rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            boxShadow: currentWord ? '0 12px 30px rgba(0,0,0,0.4), 0 0 25px rgba(56,189,248,0.4)' : 'none',
            cursor: currentWord.length >= 2 ? 'pointer' : 'default',
            transition: 'all 0.15s ease'
          }}
        >
          {currentWord ? (
            currentWord.split('').map((char, i) => (
              <span
                key={i}
                style={{
                  fontSize: '46px',
                  fontWeight: '900',
                  color: '#ffffff',
                  textShadow: '0 2px 10px rgba(56, 189, 248, 0.8)',
                  letterSpacing: '4px'
                }}
              >
                {char}
              </span>
            ))
          ) : (
            <span
              style={{
                fontSize: '22px',
                fontWeight: '700',
                color: 'rgba(255, 255, 255, 0.6)',
                letterSpacing: '1px'
              }}
            >
              Tap or swipe letters
            </span>
          )}
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={disabled || currentWord.length < 2}
          title="Submit Word"
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: currentWord.length >= 2 ? '#22c55e' : 'rgba(255,255,255,0.1)',
            border: '3px solid rgba(255,255,255,0.3)',
            color: '#ffffff',
            fontSize: '32px',
            fontWeight: '900',
            cursor: currentWord.length >= 2 ? 'pointer' : 'default',
            opacity: currentWord.length >= 2 ? 1 : 0.4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: currentWord.length >= 2 ? '0 6px 16px rgba(34, 197, 94, 0.5)' : 'none',
            transition: 'all 0.15s ease'
          }}
        >
          ✓
        </button>
      </div>

      {/* Main Wheel Container */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        style={{
          width: `${WHEEL_SIZE}px`,
          height: `${WHEEL_SIZE}px`,
          borderRadius: '50%',
          position: 'relative',
          background: 'radial-gradient(circle at 40% 40%, #1e293b 0%, #0f172a 80%, #020617 100%)',
          border: '8px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), inset 0 2px 10px rgba(255,255,255,0.1)',
          touchAction: 'none',
          cursor: 'pointer'
        }}
      >
        {/* SVG for connecting lines */}
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 1
          }}
        >
          {selectedIndices.length > 1 &&
            selectedIndices.slice(0, -1).map((nodeIdx, i) => {
              const from = letterNodes[nodeIdx];
              const to = letterNodes[selectedIndices[i + 1]];
              return (
                <line
                  key={`line-${i}`}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke="#38bdf8"
                  strokeWidth="14"
                  strokeLinecap="round"
                  filter="drop-shadow(0 0 8px rgba(56,189,248,0.8))"
                />
              );
            })}
          {/* Active trailing line to cursor/finger */}
          {isDragging && pointerPos && selectedIndices.length > 0 && (
            <line
              x1={letterNodes[selectedIndices[selectedIndices.length - 1]].x}
              y1={letterNodes[selectedIndices[selectedIndices.length - 1]].y}
              x2={pointerPos.x}
              y2={pointerPos.y}
              stroke="rgba(56, 189, 248, 0.75)"
              strokeWidth="12"
              strokeDasharray="8 6"
              strokeLinecap="round"
            />
          )}
        </svg>

        {/* Shuffle Button at the Center of Wheel */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            audio.playShuffle();
            if (onShuffle) onShuffle();
          }}
          title="Shuffle Letters"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '76px',
            height: '76px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            border: '4px solid #93c5fd',
            color: '#ffffff',
            fontSize: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 20px rgba(0,0,0,0.5)',
            cursor: 'pointer',
            zIndex: 10,
            transition: 'transform 0.15s ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.12)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)')}
        >
          🔀
        </button>

        {/* Circular Letter Nodes */}
        {letterNodes.map((node) => {
          const isSelected = selectedIndices.includes(node.id);
          return (
            <button
              key={node.id}
              type="button"
              onClick={(e) => handleLetterClick(node.id, e)}
              style={{
                position: 'absolute',
                left: `${node.x}px`,
                top: `${node.y}px`,
                transform: 'translate(-50%, -50%)',
                width: '84px',
                height: '84px',
                borderRadius: '50%',
                background: isSelected
                  ? 'radial-gradient(circle, #38bdf8 0%, #0284c7 100%)'
                  : 'radial-gradient(circle, #f8fafc 0%, #e2e8f0 100%)',
                border: isSelected ? '4px solid #ffffff' : '4px solid #cbd5e1',
                boxShadow: isSelected
                  ? '0 0 25px rgba(56, 189, 248, 0.9), 0 8px 16px rgba(0,0,0,0.4)'
                  : '0 8px 20px rgba(0,0,0,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '44px',
                fontWeight: '900',
                color: isSelected ? '#ffffff' : '#0f172a',
                zIndex: 5,
                transition: 'all 0.12s ease',
                cursor: 'pointer',
                touchAction: 'manipulation',
                outline: 'none'
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.08)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)';
              }}
            >
              {node.letter}
            </button>
          );
        })}
      </div>
    </div>
  );
};
